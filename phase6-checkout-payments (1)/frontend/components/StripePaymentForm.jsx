'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * IMPORTANT: `stripe.confirmPayment` succeeding here only means the
 * *browser* saw a successful confirmation — it is NOT what marks the
 * order as paid in our database. That only happens when Stripe's
 * webhook (payment_intent.succeeded) hits our backend, verified by
 * signature (see backend/src/controllers/webhook.controller.js).
 *
 * This component just redirects to the success page, which then polls
 * GET /api/orders/by-number/:orderNumber until paymentStatus flips to
 * PAID (the webhook is usually near-instant, but never guaranteed to
 * have landed before the browser redirect completes).
 */
export default function StripePaymentForm({ orderNumber }) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/checkout/success?orderNumber=${orderNumber}`,
      },
    });

    // confirmPayment only returns here if there's an immediate error
    // (e.g. card declined synchronously); on success it redirects away
    // to return_url automatically.
    if (confirmError) {
      setError(confirmError.message || t('paymentFailed'));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
      >
        {submitting ? t('processingPayment') : t('payNow')}
      </button>
    </form>
  );
}
