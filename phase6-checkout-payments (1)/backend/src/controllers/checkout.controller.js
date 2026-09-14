const { Address } = require('../models');
const { calculateCheckoutSummary, createOrderFromCart } = require('../services/order.service');
const stripeService = require('../services/stripe.service');

function serializeSummary(summary) {
  return {
    items: summary.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      name: i.productNameEnSnapshot,
      image: i.productImageSnapshot,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    subtotal: summary.subtotal,
    discount: summary.discount,
    shipping: summary.shipping,
    tax: summary.tax,
    total: summary.total,
    couponCode: summary.coupon?.code || null,
    estimatedDays: summary.estimatedDays,
  };
}

// GET /api/checkout/summary?addressId=&couponCode=
// Lets the frontend show a live price breakdown before committing to an order.
exports.getSummary = async (req, res, next) => {
  try {
    const { addressId, couponCode } = req.query;
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'addressId is required' });
    }

    const address = await Address.findOne({ where: { id: addressId, userId: req.user.id } });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const summary = await calculateCheckoutSummary(req.user.id, address, couponCode);
    res.json({ success: true, data: serializeSummary(summary) });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// POST /api/checkout/create-payment-intent  { addressId, couponCode? }
// Creates a PENDING order + a Stripe PaymentIntent, returns the client secret.
// The order is only marked PAID once Stripe's webhook confirms it — see
// webhook.controller.js. Frontend NEVER marks the order paid itself.
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { addressId, couponCode } = req.body;

    const order = await createOrderFromCart(req.user.id, addressId, 'STRIPE', couponCode);

    const paymentIntent = await stripeService.createPaymentIntent({
      amount: parseFloat(order.total),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: req.user.email,
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// POST /api/checkout/place-order  { addressId, couponCode? }
// Cash on Delivery path — no payment gateway involved, order goes
// straight to PROCESSING (payment collected physically on delivery).
exports.placeOrderCOD = async (req, res, next) => {
  try {
    const { addressId, couponCode } = req.body;

    const order = await createOrderFromCart(req.user.id, addressId, 'COD', couponCode);
    order.status = 'PROCESSING';
    order.placedAt = new Date();
    await order.save();

    res.status(201).json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber, total: order.total },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
