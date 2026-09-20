import { Op } from "sequelize";

import {
  sequelize,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  Address,
  Coupon,
  CouponUsage,
  CartItem,
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import deliveryZoneService from "./deliveryZone.service.js"; // from Phase 5

import couponService from "./coupon.service.js";

/**
 * Turns raw CartItem rows into a priced, locked-in snapshot. Always reads
 * Product/ProductVariant fresh from the DB — never trusts whatever the
 * cart had cached, since price/stock/status may have changed since the
 * item was added.
 */
const priceCartItems = async (cartItems) => {
  if (!cartItems.length) throw new ApiError(400, "Your cart is empty");

  const priced = [];
  for (const item of cartItems) {
    const product = await Product.findByPk(item.productId);
    if (!product || product.status !== "active") {
      throw new ApiError(
        400,
        `"${product?.nameEn || "A product"}" in your cart is no longer available`,
      );
    }

    let variant = null;
    let availableStock = product.stock;
    let unitPrice = parseFloat(product.salePrice || product.price);

    if (item.variantId) {
      variant = await ProductVariant.findByPk(item.variantId);
      if (!variant)
        throw new ApiError(
          400,
          `A selected option for "${product.nameEn}" is no longer available`,
        );
      availableStock = variant.stock;
      unitPrice += parseFloat(variant.priceModifier || 0);
    }

    if (availableStock < item.quantity) {
      throw new ApiError(400, `Not enough stock for "${product.nameEn}"`);
    }

    priced.push({
      productId: product.id,
      variantId: variant?.id || null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: parseFloat((unitPrice * item.quantity).toFixed(2)),
      productNameSnapshot: product.nameEn,
      variantSnapshot: variant
        ? { size: variant.size, color: variant.color }
        : null,
    });
  }

  return priced;
};

// addressId (saved, logged-in user) OR a raw shippingAddress object
// (guest checkout / one-off address) — either resolves to the same
// snapshot shape stored on the Order.
const resolveShippingAddress = async ({ user, addressId, shippingAddress }) => {
  if (addressId) {
    if (!user)
      throw new ApiError(
        401,
        "Log in to use a saved address, or provide a shipping address directly",
      );
    const address = await Address.findOne({
      where: { id: addressId, userId: user.id },
    });
    if (!address) throw new ApiError(404, "Address not found");

    return {
      addressId: address.id,
      snapshot: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        country: address.country,
        city: address.city,
        area: address.area,
        street: address.street,
        houseNo: address.houseNo,
        postalCode: address.postalCode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
    };
  }

  if (shippingAddress) {
    const required = [
      "name",
      "phone",
      "email",
      "country",
      "city",
      "area",
      "street",
    ];
    const missing = required.filter((f) => !shippingAddress[f]);
    if (missing.length)
      throw new ApiError(
        400,
        `Missing shipping details: ${missing.join(", ")}`,
      );
    return { addressId: null, snapshot: shippingAddress };
  }

  throw new ApiError(400, "Shipping address is required");
};

const generateOrderNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${random}`;
};

// Atomically decrements stock; throws (rolling back the caller's
// transaction) if any item no longer has enough stock right now — closes
// the race window between "add to cart" and "pay now".
const decrementStock = async (items, transaction) => {
  for (const item of items) {
    if (item.variantId) {
      const [count] = await ProductVariant.decrement(
        { stock: item.quantity },
        {
          where: { id: item.variantId, stock: { [Op.gte]: item.quantity } },
          transaction,
        },
      );
      if (!count)
        throw new ApiError(
          409,
          `"${item.productNameSnapshot}" just went out of stock`,
        );
    } else {
      const [count] = await Product.decrement(
        { stock: item.quantity },
        {
          where: { id: item.productId, stock: { [Op.gte]: item.quantity } },
          transaction,
        },
      );
      if (!count)
        throw new ApiError(
          409,
          `"${item.productNameSnapshot}" just went out of stock`,
        );
    }
  }
};

const restoreStock = async (items, transaction) => {
  for (const item of items) {
    if (item.variantId) {
      await ProductVariant.increment(
        { stock: item.quantity },
        { where: { id: item.variantId }, transaction },
      );
    } else {
      await Product.increment(
        { stock: item.quantity },
        { where: { id: item.productId }, transaction },
      );
    }
  }
};

/**
 * Runs every check (stock, address/delivery zone, coupon) and creates the
 * Order + OrderItems inside one transaction. Stock is reserved immediately
 * and the cart is cleared — the caller (Stripe vs COD flow) decides what
 * happens next.
 */
const buildOrder = async ({
  user,
  cartId,
  cartItems,
  addressId,
  shippingAddress,
  couponCode,
  paymentMethod,
}) => {
  const items = await priceCartItems(cartItems);
  const subtotal = parseFloat(
    items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2),
  );

  const { addressId: resolvedAddressId, snapshot } =
    await resolveShippingAddress({
      user,
      addressId,
      shippingAddress,
    });

  const delivery = await deliveryZoneService.checkDelivery({
    city: snapshot.city,
    area: snapshot.area,
  });
  if (!delivery.available) {
    throw new ApiError(
      400,
      delivery.reason || "We do not deliver to this location yet",
    );
  }

  let discount = 0;
  let couponResult = null;
  if (couponCode) {
    couponResult = await couponService.validateCoupon(couponCode, {
      userId: user?.id,
      items,
    });
    discount = couponResult.discount;
  }

  const taxRate = parseFloat(process.env.TAX_RATE || 0);
  const tax = parseFloat((((subtotal - discount) * taxRate) / 100).toFixed(2));
  const shippingCharge = delivery.shippingCharge;
  const total = parseFloat(
    (subtotal - discount + shippingCharge + tax).toFixed(2),
  );

  if (total <= 0)
    throw new ApiError(400, "Order total must be greater than zero");

  const order = await sequelize.transaction(async (t) => {
    const newOrder = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId: user?.id || null,
        addressId: resolvedAddressId,
        subtotal,
        discount,
        shipping: shippingCharge,
        tax,
        total,
        paymentMethod,
        paymentStatus: "unpaid",
        status: "pending",
        couponCode: couponResult ? couponResult.coupon.code : null,
        shippingAddressSnapshot: snapshot,
      },
      { transaction: t },
    );

    await OrderItem.bulkCreate(
      items.map((i) => ({
        orderId: newOrder.id,
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        paidUnitPrice: i.unitPrice,
        productNameSnapshot: i.productNameSnapshot,
        variantSnapshot: i.variantSnapshot,
      })),
      { transaction: t },
    );

    await decrementStock(items, t);

    if (couponResult) {
      await couponResult.coupon.increment("usedCount", { transaction: t });
      await CouponUsage.create(
        {
          couponId: couponResult.coupon.id,
          userId: user?.id || null,
          orderId: newOrder.id,
          discountApplied: discount,
        },
        { transaction: t },
      );
    }

    // The cart is "spent" the moment its contents are locked into an
    // order — clear it now rather than waiting on payment confirmation.
    await CartItem.destroy({ where: { cartId }, transaction: t });

    return newOrder;
  });

  return order;
};

/**
 * Reverses stock + coupon usage for an order whose Stripe payment never
 * completed (creation-time failure, or a payment_intent.payment_failed /
 * .canceled webhook). Marks the order CANCELLED/FAILED so it's clearly
 * distinguishable from a real, fulfillable order.
 */
const cancelOrderAndRestoreStock = async (
  order,
  { reason = "Payment failed", status = "cancelled" } = {},
) => {
  await sequelize.transaction(async (t) => {
    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      transaction: t,
    });
    await restoreStock(
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      t,
    );

    if (order.couponCode) {
      const coupon = await Coupon.findOne({
        where: { code: order.couponCode },
        transaction: t,
      });
      if (coupon) {
        await coupon.decrement("usedCount", { transaction: t });
        await CouponUsage.destroy({
          where: { orderId: order.id },
          transaction: t,
        });
      }
    }

    order.status = status;
    order.paymentStatus = "failed";
    await order.save({ transaction: t });
  });

  return order;
};

export {
  priceCartItems,
  resolveShippingAddress,
  generateOrderNumber,
  decrementStock,
  restoreStock,
  buildOrder,
  cancelOrderAndRestoreStock,
};
export default {
  priceCartItems,
  resolveShippingAddress,
  generateOrderNumber,
  decrementStock,
  restoreStock,
  buildOrder,
  cancelOrderAndRestoreStock,
};
