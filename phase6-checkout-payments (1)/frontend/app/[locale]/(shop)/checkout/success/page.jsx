'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getOrderByNumber } from '@/lib/api/orders';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15; // ~30 seconds — webhook is normally near-instant

/**
 * Stripe redirects here immediately after the browser confirms payment.
 * At that exact moment the backend webhook (the actual source of truth
 * for paymentStatus) may not have processed yet, so we poll briefly
 * instead of trusting the redirect itself.
 */
export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!orderNumber) return;

    const poll = async () => {
      try {
        const res = await getOrderByNumber(orderNumber);
        if (res.success) {
          setOrder(res.data);
          // COD orders are already PROCESSING immediately; Stripe orders
          // need to reach PAID via the webhook before we stop polling
          if (res.data.paymentMethod === 'COD' || res.data.paymentStatus === 'PAID' || res.data.paymentStatus === 'FAILED') {
            return; // done, stop polling
          }
        }
      } catch {
        // ignore transient errors, just keep polling until MAX_POLLS
      }

      setPollCount((c) => c + 1);
    };

    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  useEffect(() => {
    if (pollCount === 0 || pollCount >= MAX_POLLS) return;
    if (order && (order.paymentMethod === 'COD' || order.paymentStatus !== 'UNPAID')) return;

    timerRef.current = setTimeout(async () => {
      const res = await getOrderByNumber(orderNumber);
      if (res.success) setOrder(res.data);
      setPollCount((c) => c + 1);
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollCount]);

  if (!orderNumber) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-500">{t('noOrder')}</div>;
  }

  if (!order) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center animate-pulse">{t('loadingOrder')}</div>;
  }

  const isUnpaidStripe = order.paymentMethod === 'STRIPE' && order.paymentStatus === 'UNPAID';
  const stillConfirming = isUnpaidStripe && pollCount < MAX_POLLS;
  const timedOut = isUnpaidStripe && pollCount >= MAX_POLLS;
  const failed = order.paymentStatus === 'FAILED';
  const confirmed = !stillConfirming && !failed && !timedOut;

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {stillConfirming && (
        <>
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">{t('confirmingPayment')}</p>
        </>
      )}

      {confirmed && (
        <>
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{t('orderConfirmed')}</h1>
          <p className="text-sm text-gray-500 mb-1">{t('orderNumber')}: {order.orderNumber}</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">{t('currency')} {parseFloat(order.total).toFixed(2)}</p>
          <Link href={`/${locale}/orders/${order.id}`} className="inline-block mt-6 text-sm text-white bg-gray-900 rounded-lg px-5 py-2.5">
            {t('viewOrder')}
          </Link>
        </>
      )}

      {failed && (
        <>
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{t('paymentFailedTitle')}</h1>
          <p className="text-sm text-gray-500">{t('paymentFailedBody')}</p>
          <Link href={`/${locale}/checkout`} className="inline-block mt-6 text-sm text-white bg-gray-900 rounded-lg px-5 py-2.5">
            {t('tryAgain')}
          </Link>
        </>
      )}

      {timedOut && (
        <>
          <div className="text-4xl mb-3">⏳</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{t('orderNumber')}: {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-2">{t('confirmationDelayedNote')}</p>
          <Link href={`/${locale}/orders/${order.id}`} className="inline-block mt-6 text-sm text-white bg-gray-900 rounded-lg px-5 py-2.5">
            {t('viewOrder')}
          </Link>
        </>
      )}
    </div>
  );
}
