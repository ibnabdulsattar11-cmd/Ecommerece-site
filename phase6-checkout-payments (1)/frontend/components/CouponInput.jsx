'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { validateCoupon } from '@/lib/api/orders';

export default function CouponInput({ subtotal, appliedCode, onApplied, onRemoved }) {
  const t = useTranslations('checkout');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await validateCoupon(code, subtotal);
      if (res.success) {
        onApplied({ code: res.data.code, discount: res.data.discount });
        setCode('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('invalidCoupon'));
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">
        <span>
          {t('couponApplied')}: <strong>{appliedCode}</strong>
        </span>
        <button onClick={onRemoved} className="text-xs underline">
          {t('remove')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('couponPlaceholder')}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="text-sm border border-gray-300 rounded-lg px-4 py-2 disabled:opacity-50 hover:bg-gray-50"
        >
          {loading ? t('applying') : t('apply')}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
