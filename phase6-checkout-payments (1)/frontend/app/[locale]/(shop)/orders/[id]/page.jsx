'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getOrderById } from '@/lib/api/orders';

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const locale = useLocale();
  const t = useTranslations('orders');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then((res) => {
      if (res.success) setOrder(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">{t('loading')}</div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-500">{t('notFound')}</div>;

  const address = order.shippingSnapshot;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">{order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {new Date(order.createdAt).toLocaleString(locale)} · {t(`status.${order.status}`)}
      </p>

      <div className="mt-6 border border-gray-200 rounded-xl divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-3 text-sm">
            <div>
              <p className="text-gray-900">{locale === 'ar' ? item.productNameArSnapshot : item.productNameEnSnapshot}</p>
              {item.variantLabelSnapshot && <p className="text-xs text-gray-400">{item.variantLabelSnapshot}</p>}
              <p className="text-xs text-gray-400">× {item.quantity}</p>
            </div>
            <span className="text-gray-900">{t('currency')} {parseFloat(item.lineTotal).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm space-y-1.5">
        <Row label={t('subtotal')} value={order.subtotal} currency={t('currency')} />
        {parseFloat(order.discount) > 0 && (
          <Row label={t('discount')} value={-order.discount} currency={t('currency')} highlight="text-green-600" />
        )}
        <Row label={t('shipping')} value={order.shipping} currency={t('currency')} />
        <div className="flex justify-between font-semibold text-base pt-2 border-t">
          <span>{t('total')}</span>
          <span>{t('currency')} {parseFloat(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-1">{t('shippingAddress')}</p>
        <p className="text-sm text-gray-600">
          {address?.recipientName && `${address.recipientName} · `}
          {address?.formattedAddress || `${address?.street}, ${address?.area}, ${address?.city}`}
        </p>
        {address?.recipientPhone && <p className="text-xs text-gray-400 mt-0.5">{address.recipientPhone}</p>}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>{t('paymentMethod')}: {order.paymentMethod === 'COD' ? t('cod') : t('payOnline')}</p>
        <p>{t('paymentStatus')}: {t(`paymentStatusLabel.${order.paymentStatus}`)}</p>
      </div>
    </div>
  );
}

function Row({ label, value, currency, highlight }) {
  return (
    <div className={`flex justify-between ${highlight || 'text-gray-600'}`}>
      <span>{label}</span>
      <span>{currency} {parseFloat(value).toFixed(2)}</span>
    </div>
  );
}
