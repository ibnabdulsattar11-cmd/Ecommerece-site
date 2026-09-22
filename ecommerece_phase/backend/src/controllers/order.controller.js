import { Order, OrderItem, Address, OrderStatusHistory, Return } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

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
 */
const getOrderByNumber = async (req, res) => {
  const where = { orderNumber: req.params.orderNumber };
  if (req.user) where.userId = req.user.id;

  const order = await Order.findOne({ where, include: fullInclude });
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(new ApiResponse(200, order));
};

export { getMyOrders, getOrderById, getOrderByNumber };
export default { getMyOrders, getOrderById, getOrderByNumber };