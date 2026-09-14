const { Order, OrderItem, Address, OrderStatusHistory, Return } = require("../models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Extends Phase 6's fullInclude with the tracking timeline and any return
// request, so the order detail page has everything in one call.
const fullInclude = [
  { model: OrderItem, as: "OrderItems" },
  { model: Address, as: "Address" },
  { model: OrderStatusHistory, as: "StatusHistory", separate: true, order: [["createdAt", "ASC"]] },
  { model: Return },
];

// GET /api/orders  (logged-in user's own orders, paginated)
const getMyOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const { rows, count } = await Order.findAndCountAll({
    where: { userId: req.user.id },
    include: fullInclude,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  const response = new ApiResponse(200, rows);
  response.pagination = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
  res.status(200).json(response);
};

// GET /api/orders/:id  (must belong to the requesting user)
const getOrderById = async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id }, include: fullInclude });
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, order));
};

/**
 * GET /api/orders/by-number/:orderNumber
 * Used by the checkout success page right after the Stripe redirect, and
 * by guests (no account) to look up the order they just placed — the
 * unguessable order number is the access control in that case.
 */
const getOrderByNumber = async (req, res) => {
  const where = { orderNumber: req.params.orderNumber };
  if (req.user) where.userId = req.user.id;

  const order = await Order.findOne({ where, include: fullInclude });
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, order));
};

module.exports = { getMyOrders, getOrderById, getOrderByNumber };
