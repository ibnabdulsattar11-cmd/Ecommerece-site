'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Publishable key is safe to expose to the browser (unlike the secret
// key used server-side in stripe.service.js).
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeProvider({ clientSecret, children }) {
  if (!clientSecret) return null;

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
