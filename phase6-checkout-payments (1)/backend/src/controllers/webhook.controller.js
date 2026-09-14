const { Order } = require('../models');
const stripeService = require('../services/stripe.service');
const { releaseOrderReservation } = require('../services/order.service');

/**
 * POST /api/webhooks/stripe
 *
 * This is the ONLY code path that ever sets paymentStatus = 'PAID'.
 * The frontend's "payment succeeded" callback from Stripe.js is just a
 * UI hint to show a spinner/redirect — it is never trusted to confirm
 * money actually moved. Only a signature-verified webhook event does that.
 *
 * Route must be mounted with express.raw({ type: 'application/json' })
 * BEFORE the global express.json() body parser — see webhook.routes.js
 * and the README for the exact app.js wiring.
 */
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({ where: { stripePaymentIntentId: paymentIntent.id } });

        if (!order) {
          console.error('Webhook: no matching order for payment intent', paymentIntent.id);
          break;
        }

        // idempotency guard — Stripe can deliver the same event more than
        // once, so don't double-process an already-paid order
        if (order.paymentStatus !== 'PAID') {
          order.paymentStatus = 'PAID';
          order.status = 'PROCESSING';
          order.placedAt = new Date();
          await order.save();
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({ where: { stripePaymentIntentId: paymentIntent.id } });

        if (order && order.paymentStatus === 'UNPAID') {
          order.paymentStatus = 'FAILED';
          order.status = 'FAILED';
          await order.save();
          // give the stock + coupon usage back since this order will never be paid
          await releaseOrderReservation(order);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        const order = await Order.findOne({ where: { stripePaymentIntentId: paymentIntent.id } });

        if (order && order.paymentStatus === 'UNPAID') {
          order.status = 'CANCELLED';
          order.cancelledAt = new Date();
          order.cancelReason = 'Payment cancelled';
          await order.save();
          await releaseOrderReservation(order);
        }
        break;
      }

      default:
        // unhandled event types are fine to ignore — Stripe sends many
        // event types we don't currently act on
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Return 500 (not 200) on unexpected processing errors — Stripe will
    // automatically retry the event with backoff, which is what we want
    // for something like a transient DB outage. Only intentionally-ignored
    // cases (e.g. "no matching order") resolve as 200 above.
    res.status(500).json({ received: false });
  }
};
