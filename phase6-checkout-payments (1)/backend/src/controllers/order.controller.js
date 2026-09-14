const { Order, OrderItem, Address } = require('../models');

const fullInclude = [
  { model: OrderItem, as: 'items' },
  { model: Address, as: 'address' },
];

// GET /api/orders  (logged-in user's own orders, paginated)
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { rows, count } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: fullInclude,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  (must belong to the requesting user)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: fullInclude,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/by-number/:orderNumber
 * Used by the checkout success page right after redirect from Stripe —
 * at that moment the webhook may not have processed yet, so this endpoint
 * is polled briefly by the frontend until paymentStatus flips to PAID
 * (see CheckoutSuccessPage.jsx).
 */
exports.getOrderByNumber = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderNumber: req.params.orderNumber, userId: req.user.id },
      include: fullInclude,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// Note: cancel / return-request / tracking-status-history endpoints are
// intentionally NOT here — they belong to Phase 7 (Order Management &
// Tracking), which will extend this same controller/routes file.
