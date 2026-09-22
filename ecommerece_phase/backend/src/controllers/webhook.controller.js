import stripe from "../config/stripe.js";

import { Order, User } from "../models/index.js";

import checkoutService from "../services/checkout.service.js";

import { sendOrderStatusEmail } from "../services/email.service.js"; 

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

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    res.status(500).json({ received: false });
  }
};

export { handleStripeWebhook };
