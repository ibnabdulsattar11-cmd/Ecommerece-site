const {
  sequelize, Cart, CartItem, Product, ProductVariant, ProductImage,
  Address, Order, OrderItem, Coupon, CouponUsage,
} = require('../models');
const { checkDeliveryZone } = require('./deliveryZone.service');

// e.g. ORD-20260914-4821
function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${date}-${random}`;
}

/**
 * Loads the user's cart with product/variant data needed to price it
 * fresh at checkout time (never trust cached cart snapshot prices for
 * the actual charge — re-read current Product.price/salePrice).
 */
async function getPricedCart(userId) {
  const cart = await Cart.findOne({
    where: { userId },
    include: [
      {
        model: CartItem,
        as: 'items',
        include: [
          { model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', limit: 1 }] },
          { model: ProductVariant, as: 'variant' },
        ],
      },
    ],
  });

  if (!cart || !cart.items.length) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  const items = cart.items.map((item) => {
    const product = item.product;
    if (!product || product.status !== 'ACTIVE') {
      const err = new Error(`"${product?.nameEn || 'A product'}" is no longer available`);
      err.statusCode = 400;
      throw err;
    }

    const availableStock = item.variant ? item.variant.stock : product.stock;
    if (availableStock < item.quantity) {
      const err = new Error(`Not enough stock for "${product.nameEn}"`);
      err.statusCode = 400;
      throw err;
    }

    const unitPrice = parseFloat(product.salePrice || product.price) + parseFloat(item.variant?.priceModifier || 0);

    return {
      cartItemId: item.id,
      productId: product.id,
      variantId: item.variant?.id || null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: parseFloat((unitPrice * item.quantity).toFixed(2)),
      productNameEnSnapshot: product.nameEn,
      productNameArSnapshot: product.nameAr,
      productImageSnapshot: product.images?.[0]?.url || null,
      variantLabelSnapshot: item.variant ? [item.variant.color, item.variant.size].filter(Boolean).join(' / ') : null,
    };
  });

  return { cart, items };
}

/**
 * Validates a coupon code against subtotal/user history. Returns the
 * discount amount (0 if no coupon) and the Coupon row (null if none/invalid).
 * Throws with statusCode for invalid coupons so the checkout controller
 * can surface a clean 400 rather than silently ignoring a typo'd code.
 */
async function validateCoupon(code, userId, subtotal) {
  if (!code) return { discount: 0, coupon: null };

  const coupon = await Coupon.findOne({ where: { code: code.toUpperCase().trim(), isActive: true } });
  if (!coupon) {
    const err = new Error('Invalid coupon code');
    err.statusCode = 400;
    throw err;
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    const err = new Error('This coupon has expired');
    err.statusCode = 400;
    throw err;
  }
  if (subtotal < parseFloat(coupon.minOrder || 0)) {
    const err = new Error(`This coupon requires a minimum order of ${coupon.minOrder}`);
    err.statusCode = 400;
    throw err;
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error('This coupon has reached its usage limit');
    err.statusCode = 400;
    throw err;
  }

  const userUsageCount = await CouponUsage.count({ where: { couponId: coupon.id, userId } });
  if (userUsageCount >= coupon.perUserLimit) {
    const err = new Error('You have already used this coupon');
    err.statusCode = 400;
    throw err;
  }

  let discount = coupon.type === 'PERCENT' ? (subtotal * parseFloat(coupon.value)) / 100 : parseFloat(coupon.value);

  if (coupon.type === 'PERCENT' && coupon.maxDiscount) {
    discount = Math.min(discount, parseFloat(coupon.maxDiscount));
  }
  discount = Math.min(discount, subtotal); // never discount more than the order is worth

  return { discount: parseFloat(discount.toFixed(2)), coupon };
}

/**
 * Computes the full price breakdown for a checkout preview (used by
 * GET /api/checkout/summary so the frontend can show totals before
 * committing to create the order).
 */
async function calculateCheckoutSummary(userId, address, couponCode) {
  const { cart, items } = await getPricedCart(userId);
  const subtotal = parseFloat(items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));

  const zoneResult = await checkDeliveryZone(address.city, address.area, subtotal);
  if (!zoneResult.available) {
    const err = new Error(zoneResult.reason || 'We do not deliver to this address');
    err.statusCode = 400;
    throw err;
  }

  const { discount, coupon } = await validateCoupon(couponCode, userId, subtotal);
  const shipping = zoneResult.shippingCharge;
  const tax = 0; // no tax configured yet — plug in a rate here if/when needed
  const total = parseFloat((subtotal - discount + shipping + tax).toFixed(2));

  return { cart, items, subtotal, discount, shipping, tax, total, coupon, estimatedDays: zoneResult.estimatedDays };
}

/**
 * Creates the Order + OrderItems, decrements stock, records coupon usage,
 * and clears the cart — all inside one transaction so a failure partway
 * through never leaves stock decremented without a matching order.
 *
 * Does NOT touch Stripe. The caller (checkout.controller.js) decides what
 * to do next based on paymentMethod: create a PaymentIntent for STRIPE,
 * or immediately mark PROCESSING for COD.
 */
async function createOrderFromCart(userId, addressId, paymentMethod, couponCode) {
  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    const err = new Error('Address not found');
    err.statusCode = 404;
    throw err;
  }

  const summary = await calculateCheckoutSummary(userId, address, couponCode);

  const t = await sequelize.transaction();
  try {
    // Decrement stock now (order-creation time) to prevent overselling
    // while payment is in progress. Released back on payment failure —
    // see webhook.controller.js's payment_intent.payment_failed handler.
    for (const item of summary.items) {
      if (item.variantId) {
        const [updated] = await ProductVariant.decrement('stock', {
          by: item.quantity,
          where: { id: item.variantId, stock: { [sequelize.Sequelize.Op.gte]: item.quantity } },
          transaction: t,
        });
        if (!updated) throw Object.assign(new Error('Stock changed, please review your cart'), { statusCode: 409 });
      } else {
        const [updated] = await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId, stock: { [sequelize.Sequelize.Op.gte]: item.quantity } },
          transaction: t,
        });
        if (!updated) throw Object.assign(new Error('Stock changed, please review your cart'), { statusCode: 409 });
      }
    }

    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        shippingSnapshot: {
          label: address.label,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone,
          country: address.country,
          city: address.city,
          area: address.area,
          street: address.street,
          houseNo: address.houseNo,
          landmark: address.landmark,
          postalCode: address.postalCode,
          formattedAddress: address.formattedAddress,
        },
        subtotal: summary.subtotal,
        discount: summary.discount,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        couponId: summary.coupon?.id || null,
        couponCode: summary.coupon?.code || null,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        stockReserved: true,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      summary.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productNameEnSnapshot: item.productNameEnSnapshot,
        productNameArSnapshot: item.productNameArSnapshot,
        productImageSnapshot: item.productImageSnapshot,
        variantLabelSnapshot: item.variantLabelSnapshot,
        quantity: item.quantity,
        paidUnitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      { transaction: t }
    );

    if (summary.coupon) {
      await CouponUsage.create(
        { couponId: summary.coupon.id, userId, orderId: order.id },
        { transaction: t }
      );
      await summary.coupon.increment('usedCount', { transaction: t });
    }

    // items have now become an order — clear the cart
    if (summary.cart) {
      await CartItem.destroy({ where: { cartId: summary.cart.id }, transaction: t });
    }

    await t.commit();
    return order;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * Reverses stock decrement + coupon usage for an order whose payment
 * failed or expired. Called from the Stripe webhook handler.
 */
async function releaseOrderReservation(order) {
  if (!order.stockReserved) return;

  const t = await sequelize.transaction();
  try {
    const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });

    for (const item of items) {
      if (item.variantId) {
        await ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variantId }, transaction: t });
      } else {
        await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
      }
    }

    if (order.couponId) {
      await CouponUsage.destroy({ where: { orderId: order.id }, transaction: t });
      await Coupon.decrement('usedCount', { where: { id: order.couponId }, transaction: t });
    }

    order.stockReserved = false;
    await order.save({ transaction: t });

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = {
  generateOrderNumber,
  getPricedCart,
  validateCoupon,
  calculateCheckoutSummary,
  createOrderFromCart,
  releaseOrderReservation,
};
