const { Order, OrderItem, Address } = require("../../models");
const ApiResponse = require("../../utils/ApiResponse");
const orderTrackingService = require("../../services/orderTracking.service");

// GET /api/admin/orders?status=&page=&limit=
const listOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: "OrderItems" },
      { model: Address, as: "Address" },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  const response = new ApiResponse(200, rows);
  response.pagination = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
  res.status(200).json(response);
};

// PATCH /api/admin/orders/:id/status
// { status?, note?, trackingNumber?, courierName?, trackingUrl?, estimatedDeliveryDate? }
const updateOrderStatus = async (req, res) => {
  const order = await orderTrackingService.updateOrderStatus(req.params.id, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, order, "Order updated"));
};

module.exports = { listOrders, updateOrderStatus };
