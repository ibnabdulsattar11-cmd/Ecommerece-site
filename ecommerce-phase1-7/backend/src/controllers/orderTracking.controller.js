const { Order } = require("../models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const orderTrackingService = require("../services/orderTracking.service");

// POST /api/orders/:id/cancel  { reason? }
const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!order) throw new ApiError(404, "Order not found");

  const { order: updated, refunded } = await orderTrackingService.cancelOrder(order, { reason: req.body.reason });

  res
    .status(200)
    .json(new ApiResponse(200, updated, refunded ? "Order cancelled — your payment has been refunded" : "Order cancelled"));
};

// POST /api/orders/:id/return  { itemsReturned: [{orderItemId, quantity}], reason }
const requestReturn = async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!order) throw new ApiError(404, "Order not found");

  const returnRequest = await orderTrackingService.requestReturn(order, {
    itemsReturned: req.body.itemsReturned,
    reason: req.body.reason,
  });

  res.status(201).json(new ApiResponse(201, returnRequest, "Return request submitted"));
};

module.exports = { cancelOrder, requestReturn };
