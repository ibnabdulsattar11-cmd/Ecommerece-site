'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getAddresses } from '@/lib/api/address'; // from Phase 5
import { getCheckoutSummary, createPaymentIntent, placeOrderCOD } from '@/lib/api/checkout';
import CouponInput from '@/components/CouponInput';
import StripeProvider from '@/components/StripeProvider';
import StripePaymentForm from '@/components/StripePaymentForm';
import { useCartStore } from '@/store/cartStore'; // from Phase 4

const STEPS = { ADDRESS: 1, REVIEW: 2, PAYMENT: 3 };

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(STEPS.ADDRESS);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [clientSecret, setClientSecret] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAddresses().then((res) => {
      if (res.success) {
        setAddresses(res.data);
        const def = res.data.find((a) => a.isDefault) || res.data[0];
        if (def) setSelectedAddressId(def.id);
      }
    });
  }, []);

  const loadSummary = async () => {
    if (!selectedAddressId) return;
    setLoadingSummary(true);
    setError('');
    try {
      const res = await getCheckoutSummary(selectedAddressId, coupon?.code);
      if (res.success) setSummary(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || t('summaryFailed'));
    } finally {
      setLoadingSummary(false);
    }
  };

  const goToReview = async () => {
    if (!selectedAddressId) {
      setError(t('selectAddressFirst'));
      return;
    }
    await loadSummary();
    setStep(STEPS.REVIEW);
  };

  // re-fetch summary whenever the coupon changes while on the review step
  useEffect(() => {
    if (step === STEPS.REVIEW) loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon?.code]);

  const proceedToPayment = async () => {
    setError('');
    setPlacing(true);
    try {
      if (paymentMethod === 'COD') {
        const res = await placeOrderCOD(selectedAddressId, coupon?.code);
        if (res.success) {
          useCartStore.getState().loadCart(); // cart is now empty server-side
          router.push(`/${locale}/checkout/success?orderNumber=${res.data.orderNumber}`);
        }
      } else {
        const res = await createPaymentIntent(selectedAddressId, coupon?.code);
        if (res.success) {
          setClientSecret(res.data.clientSecret);
          setOrderNumber(res.data.orderNumber);
          setStep(STEPS.PAYMENT);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('orderFailed'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('title')}</h1>
      <Stepper current={step} />

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

      {/* Step 1: Address */}
      {step === STEPS.ADDRESS && (
        <div className="mt-6 space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('noAddresses')}{' '}
              <a href={`/${locale}/addresses`} className="underline">
                {t('addAddress')}
              </a>
            </p>
          ) : (
            addresses.map((addr) => (
              <label
                key={addr.id}
                className={`block border rounded-xl p-4 cursor-pointer ${
                  selectedAddressId === addr.id ? 'border-gray-900' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.formattedAddress || `${addr.street}, ${addr.area}, ${addr.city}`}</p>
                    {addr.recipientPhone && <p className="text-xs text-gray-400 mt-0.5">{addr.recipientPhone}</p>}
                  </div>
                </div>
              </label>
            ))
          )}

          <button
            onClick={goToReview}
            disabled={!selectedAddressId || loadingSummary}
            className="w-full mt-4 bg-gray-900 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
          >
            {loadingSummary ? t('loading') : t('continue')}
          </button>
        </div>
      )}

      {/* Step 2: Review + coupon + payment method choice */}
      {step === STEPS.REVIEW && summary && (
        <div className="mt-6 space-y-5">
          <div className="border border-gray-200 rounded-xl divide-y">
            {summary.items.map((item, i) => (
              <div key={i} className="flex justify-between p-3 text-sm">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-900">{t('currency')} {item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <CouponInput
            subtotal={summary.subtotal}
            appliedCode={coupon?.code}
            onApplied={setCoupon}
            onRemoved={() => setCoupon(null)}
          />

          <div className="text-sm space-y-1.5 border-t pt-4">
            <Row label={t('subtotal')} value={summary.subtotal} currency={t('currency')} />
            {summary.discount > 0 && (
              <Row label={t('discount')} value={-summary.discount} currency={t('currency')} highlight="text-green-600" />
            )}
            <Row label={t('shipping')} value={summary.shipping} currency={t('currency')} />
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>{t('total')}</span>
              <span>{t('currency')} {summary.total.toFixed(2)}</span>
            </div>
            {summary.estimatedDays && (
              <p className="text-xs text-gray-400">
                {t('estimatedDelivery', { min: summary.estimatedDays.min, max: summary.estimatedDays.max })}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t('paymentMethod')}</p>
            <div className="grid grid-cols-2 gap-2">
              <PaymentOption
                selected={paymentMethod === 'COD'}
                onClick={() => setPaymentMethod('COD')}
                label={t('cod')}
              />
              <PaymentOption
                selected={paymentMethod === 'STRIPE'}
                onClick={() => setPaymentMethod('STRIPE')}
                label={t('payOnline')}
              />
            </div>
          </div>

          <button
            onClick={proceedToPayment}
            disabled={placing}
            className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
          >
            {placing ? t('placing') : paymentMethod === 'COD' ? t('placeOrder') : t('continueToPayment')}
          </button>
        </div>
      )}

      {/* Step 3: Stripe payment (only reached for online payment) */}
      {step === STEPS.PAYMENT && clientSecret && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">{t('orderNumber')}: {orderNumber}</p>
          <StripeProvider clientSecret={clientSecret}>
            <StripePaymentForm orderNumber={orderNumber} />
          </StripeProvider>
        </div>
      )}
    </div>
  );
}

function Stepper({ current }) {
  const labels = ['Address', 'Review', 'Payment'];
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      {labels.map((label, i) => (
        <span key={label} className={i + 1 <= current ? 'text-gray-900 font-medium' : ''}>
          {i + 1}. {label}{i < labels.length - 1 ? ' →' : ''}
        </span>
      ))}
    </div>
  );
}

function Row({ label, value, currency, highlight }) {
  return (
    <div className={`flex justify-between ${highlight || 'text-gray-600'}`}>
      <span>{label}</span>
      <span>{currency} {value.toFixed(2)}</span>
    </div>
  );
}

function PaymentOption({ selected, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-lg py-2.5 text-sm ${selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'}`}
    >
      {label}
    </button>
  );
}
