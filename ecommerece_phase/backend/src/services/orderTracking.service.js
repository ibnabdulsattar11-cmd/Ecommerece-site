import {
  sequelize,
  Order,
  OrderItem,
  OrderStatusHistory,
  Return,
  Coupon,
  CouponUsage,
  User,
  Notification,
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import { sendOrderStatusEmail } from "../services/email.service.js"; // from Phase 1-2

import checkoutService from "../services/checkout.service.js"; // from Phase 6 — reuses restoreStock

import refundService from "./refund.service.js";

// Which status can move to which next — used by both the customer cancel
// action and the admin status-update endpoint so the two can never drift
// out of sync with each other.
const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: ["return_requested"],
  return_requested: ["returned", "delivered"], // "delivered" = a rejected return goes back to normal
  returned: ["refunded"],
  cancelled: [],
  refunded: [],
};

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];
const RETURN_WINDOW_DAYS = parseInt(process.env.RETURN_WINDOW_DAYS || "7", 10);

const NOTIFICATION_TYPE_BY_STATUS = {
  confirmed: "order_confirmed",
  processing: "order_confirmed",
  shipped: "order_shipped",
  out_for_delivery: "order_shipped",
  delivered: "order_delivered",
  cancelled: "order_cancelled",
  return_requested: "return_update",
  returned: "return_update",
  refunded: "return_update",
};

const recordStatusHistory = async (
  order,
  status,
  note,
  adminId,
  transaction,
) => {
  await OrderStatusHistory.create(
    {
      orderId: order.id,
      status,
      note: note || null,
      changedByAdminId: adminId || null,
    },
    { transaction },
  );
};

const notifyCustomer = async (order, status) => {
  if (!order.userId) return; // guest order — nothing to notify in-app
  const user = await User.findByPk(order.userId);
  if (!user) return;

  if (user.email) sendOrderStatusEmail(user, order).catch(() => {});

  await Notification.create({
    userId: order.userId,
    type: NOTIFICATION_TYPE_BY_STATUS[status] || "general",
    title: `Order ${order.orderNumber}`,
    message: `Your order status is now: ${status.replace(/_/g, " ")}`,
    metadata: { orderId: order.id },
  }).catch(() => {});
};

/**
 * Admin: change status and/or courier details. Validates the transition
 * against ALLOWED_TRANSITIONS, records it in OrderStatusHistory, and
 * notifies the customer.
 */
const updateOrderStatus = async (
  orderId,
  {
    status,
    note,
    trackingNumber,
    courierName,
    trackingUrl,
    estimatedDeliveryDate,
  },
  adminId,
) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (status && status !== order.status) {
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new ApiError(
        400,
        `Cannot move an order from "${order.status}" to "${status}"`,
      );
    }
  }

  await sequelize.transaction(async (t) => {
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (estimatedDeliveryDate !== undefined)
      order.estimatedDeliveryDate = estimatedDeliveryDate;

    const statusChanged = status && status !== order.status;
    if (statusChanged) order.status = status;

    await order.save({ transaction: t });
    if (statusChanged)
      await recordStatusHistory(order, status, note, adminId, t);
  });

  if (status) await notifyCustomer(order, status);
  return order;
};

/**
 * Customer (or admin, via the same function) cancels an order. Only
 * allowed before it ships. Refunds automatically via Stripe if it was
 * already paid; always releases reserved stock and any coupon usage.
 */
const cancelOrder = async (order, { reason, adminId } = {}) => {
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    throw new ApiError(
      400,
      `Orders that are already "${order.status}" can no longer be cancelled — request a return instead once delivered, or contact support.`,
    );
  }

  let refunded = false;
  if (
    order.paymentStatus === "paid" &&
    order.paymentMethod === "stripe" &&
    order.stripePaymentIntentId
  ) {
    await refundService.refundPaymentIntent(order.stripePaymentIntentId);
    refunded = true;
  }

  await sequelize.transaction(async (t) => {
    const items = await OrderItem.findAll({
      where: { orderId: order.id },
      transaction: t,
    });
    await checkoutService.restoreStock(
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

    order.status = "cancelled";
    if (refunded) order.paymentStatus = "refunded";
    await order.save({ transaction: t });
    await recordStatusHistory(
      order,
      "cancelled",
      reason || (adminId ? "Cancelled by admin" : "Cancelled by customer"),
      adminId,
      t,
    );
  });

  await notifyCustomer(order, "cancelled");
  return { order, refunded };
};

/**
 * Customer requests a return for a delivered order, within the return
 * window. One return request per order (it can cover multiple items —
 * see `itemsReturned`); a second request isn't allowed until the first is
 * resolved (rejected orders can be corrected by contacting support).
 */
const requestReturn = async (order, { itemsReturned, reason }) => {
  if (order.status !== "delivered") {
    throw new ApiError(
      400,
      "Returns can only be requested for delivered orders",
    );
  }

  const deliveredEntry = await OrderStatusHistory.findOne({
    where: { orderId: order.id, status: "delivered" },
    order: [["createdAt", "DESC"]],
  });
  const deliveredAt = deliveredEntry?.createdAt || order.updatedAt;
  const daysSinceDelivery =
    (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
    throw new ApiError(
      400,
      `The return window (${RETURN_WINDOW_DAYS} days after delivery) has passed`,
    );
  }

  const existing = await Return.findOne({ where: { orderId: order.id } });
  if (existing)
    throw new ApiError(
      400,
      "A return has already been requested for this order",
    );

  const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
  for (const ret of itemsReturned) {
    const orderItem = orderItems.find((i) => i.id === ret.orderItemId);
    if (!orderItem)
      throw new ApiError(
        400,
        "One of the selected items does not belong to this order",
      );
    if (ret.quantity < 1 || ret.quantity > orderItem.quantity) {
      throw new ApiError(
        400,
        `Invalid return quantity for "${orderItem.productNameSnapshot}"`,
      );
    }
  }

  const returnRequest = await Return.create({
    orderId: order.id,
    reason,
    itemsReturned,
    status: "requested",
    refundStatus: "pending",
  });

  order.status = "return_requested";
  await order.save();
  await recordStatusHistory(
    order,
    "return_requested",
    "Customer requested a return",
    null,
  );
  await notifyCustomer(order, "return_requested");

  return returnRequest;
};

/**
 * Admin moves a return through: requested -> approved -> received -> completed
 * (or requested -> rejected, which puts the order back to "delivered").
 * Refund is only actually issued at "completed" — after the item is
 * confirmed physically back — never earlier.
 */
const reviewReturn = async (
  returnRequest,
  { status, adminNote, refundAmount },
  adminId,
) => {
  const order = await Order.findByPk(returnRequest.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (adminNote !== undefined) returnRequest.adminNote = adminNote;

  if (status === "rejected") {
    returnRequest.status = "rejected";
    returnRequest.refundStatus = "not_applicable";
    await returnRequest.save();

    order.status = "delivered";
    await order.save();
    await recordStatusHistory(
      order,
      "delivered",
      "Return request rejected",
      adminId,
    );
    await notifyCustomer(order, "return_requested");
    return returnRequest;
  }

  if (status === "approved") {
    returnRequest.status = "approved";
    returnRequest.refundStatus = "pending";
    await returnRequest.save();
    return returnRequest; // awaiting the item to be physically received back
  }

  if (status === "received") {
    returnRequest.status = "received";
    returnRequest.refundStatus = "processing";
    await returnRequest.save();
    return returnRequest;
  }

  if (status === "completed") {
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
    });

    let amount = refundAmount;
    if (amount === undefined) {
      amount = returnRequest.itemsReturned.reduce((sum, ret) => {
        const item = orderItems.find((i) => i.id === ret.orderItemId);
        return sum + (item ? parseFloat(item.paidUnitPrice) * ret.quantity : 0);
      }, 0);
    }
    amount = parseFloat(amount.toFixed(2));

    let refundedViaGateway = false;
    if (
      order.paymentMethod === "stripe" &&
      order.paymentStatus === "paid" &&
      order.stripePaymentIntentId
    ) {
      await refundService.refundPaymentIntent(
        order.stripePaymentIntentId,
        amount,
      );
      refundedViaGateway = true;
    }

    await sequelize.transaction(async (t) => {
      const restockItems = returnRequest.itemsReturned
        .map((ret) => {
          const item = orderItems.find((i) => i.id === ret.orderItemId);
          return item
            ? {
                productId: item.productId,
                variantId: item.variantId,
                quantity: ret.quantity,
              }
            : null;
        })
        .filter(Boolean);
      await checkoutService.restoreStock(restockItems, t);

      returnRequest.status = "completed";
      // COD orders have no gateway to refund through — the admin settles
      // that cash refund outside the system; we just record it here.
      returnRequest.refundStatus =
        refundedViaGateway || order.paymentMethod === "cod"
          ? "refunded"
          : "processing";
      returnRequest.refundAmount = amount;
      await returnRequest.save({ transaction: t });

      order.status = "returned";
      if (
        returnRequest.refundStatus === "refunded" &&
        amount >= parseFloat(order.total)
      ) {
        order.paymentStatus = "refunded";
      }
      await order.save({ transaction: t });

      await recordStatusHistory(
        order,
        "returned",
        `Return completed — refund ${amount}`,
        adminId,
        t,
      );
    });

    await notifyCustomer(order, "returned");
    return returnRequest;
  }

  throw new ApiError(400, `Unsupported return status: ${status}`);
};

export {
  ALLOWED_TRANSITIONS,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  reviewReturn,
  recordStatusHistory,
};
export default {
  ALLOWED_TRANSITIONS,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  reviewReturn,
  recordStatusHistory,
};
