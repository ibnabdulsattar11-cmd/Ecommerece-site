'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getMyOrders } from '@/lib/api/orders';

const STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  FAILED: 'bg-red-50 text-red-600',
};

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then((res) => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">{t('loading')}</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">{t('empty')}</p>
        <Link href={`/${locale}/products`} className="text-sm text-white bg-gray-900 rounded-lg px-5 py-2.5">
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('title')}</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${locale}/orders/${order.id}`}
            className="block border border-gray-200 rounded-xl p-4 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString(locale)} · {order.items?.length || 0} {t('items')}
                </p>
              </div>
              <div className="text-end">
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                  {t(`status.${order.status}`)}
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {t('currency')} {parseFloat(order.total).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
