import stripe from "../config/stripe.js"; // from Phase 6
 // from Phase 6

/**
 * Issues a refund against a PaymentIntent. Omit `amount` for a full refund;
 * pass it (in the same major unit the order total is stored in, e.g.
 * dollars) for a partial refund — Stripe wants cents, so we convert here.
 */
const refundPaymentIntent = async (paymentIntentId, amount) => {
  const params = { payment_intent: paymentIntentId };
  if (amount !== undefined) params.amount = Math.round(amount * 100);
  return stripe.refunds.create(params);
};

export { refundPaymentIntent };
export default { refundPaymentIntent };