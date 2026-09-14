const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe PaymentIntent for the given order total. Amount must be
 * in the smallest currency unit (e.g. paisa for PKR — Stripe treats PKR
 * as zero-decimal? No — PKR is a standard 2-decimal currency in Stripe,
 * so multiply by 100 same as USD/EUR). Adjust `currency` to match your
 * actual settlement currency/Stripe account configuration.
 */
exports.createPaymentIntent = async ({ amount, currency = 'pkr', orderId, orderNumber, customerEmail }) => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { orderId, orderNumber },
    receipt_email: customerEmail,
    automatic_payment_methods: { enabled: true },
  });
};

exports.retrievePaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

exports.cancelPaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.cancel(paymentIntentId).catch(() => null); // no-op if already succeeded/cancelled
};

/**
 * Verifies the raw webhook payload against Stripe's signature header.
 * MUST be called with the raw (unparsed) request body — see
 * webhook.routes.js, which uses express.raw() instead of express.json()
 * for this one route.
 */
exports.constructWebhookEvent = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
};
