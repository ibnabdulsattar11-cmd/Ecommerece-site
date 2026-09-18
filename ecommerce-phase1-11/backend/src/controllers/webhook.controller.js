import stripe from "../config/stripe.js";

import { Order, User } from "../models/index.js";

import checkoutService from "../services/checkout.service.js";

import { sendOrderStatusEmail } from "../services/email.service.js"; /**
 * POST /api/webhooks/stripe
 *
 * This is the ONLY code path that ever sets paymentStatus = "paid". The
 * frontend's Stripe.js "succeeded" callback is just a UI hint to show a
 * spinner/redirect — it is never trusted on its own. Only a
 * signature-verified webhook event confirms money actually moved.
 *
 * Must be mounted with express.raw({ type: "application/json" }) BEFORE
 * the app's global express.json() — see webhook.routes.js and this
 * folder's README for the exact app.js wiring.
 */
const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const order = await Order.findOne({
          where: { stripePaymentIntentId: pi.id },
        });

        // Idempotency guard — Stripe can deliver the same event more than
        // once; never double-process an already-paid order.
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "confirmed";
          await order.save();

          if (order.userId) {
            const user = await User.findByPk(order.userId);
            if (user?.email) sendOrderStatusEmail(user, order).catch(() => {});
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const order = await Order.findOne({
          where: { stripePaymentIntentId: pi.id },
        });
        if (order && order.status === "pending") {
          await checkoutService.cancelOrderAndRestoreStock(order, {
            reason: "Payment failed",
            status: "cancelled",
          });
        }
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object;
        const order = await Order.findOne({
          where: { stripePaymentIntentId: pi.id },
        });
        if (order && order.status === "pending") {
          await checkoutService.cancelOrderAndRestoreStock(order, {
            reason: "Payment cancelled",
            status: "cancelled",
          });
        }
        break;
      }

      default:
        break; // other event types are fine to ignore
    }

    // Acknowledge once the signature is verified — 200 tells Stripe not to
    // retry. Intentionally-ignored cases (no matching order, etc.) still
    // resolve as 200 above.
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    // Non-2xx here makes Stripe retry with backoff — appropriate for a
    // transient failure (e.g. DB hiccup) on our side.
    res.status(500).json({ received: false });
  }
};

export default { handleStripeWebhook };
