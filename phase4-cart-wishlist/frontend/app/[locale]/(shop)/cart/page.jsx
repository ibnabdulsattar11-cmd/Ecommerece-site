'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const isAr = locale === 'ar';

  const { items, subtotal, loading, loadCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && items.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">{t('loading')}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">{t('empty')}</p>
        <Link href={`/${locale}/products`} className="text-sm text-white bg-gray-900 rounded-lg px-5 py-2.5">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('title')}</h1>

      <div className="space-y-4">
        {items.map((item) => {
          const product = item.product;
          const name = isAr ? product?.nameAr : product?.nameEn;
          const image = product?.images?.[0]?.thumbnailUrl || product?.images?.[0]?.url || '/placeholder.png';
          const lineTotal = (parseFloat(item.unitPriceSnapshot) * item.quantity).toFixed(2);

          return (
            <div key={item.id} className="flex gap-4 border border-gray-200 rounded-xl p-3">
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <Image src={image} alt={name || ''} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/${locale}/products/${product?.slug}`} className="text-sm font-medium text-gray-900 line-clamp-1">
                  {name}
                </Link>
                {item.variant && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[item.variant.color, item.variant.size].filter(Boolean).join(' / ')}
                  </p>
                )}
                <p className="text-sm text-gray-700 mt-1">
                  {t('currency')} {parseFloat(item.unitPriceSnapshot).toFixed(2)}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:underline ms-2"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>

              <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {t('currency')} {lineTotal}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">{t('subtotal')}</span>
        <span className="text-xl font-bold text-gray-900">
          {t('currency')} {subtotal.toFixed(2)}
        </span>
      </div>

      <Link
        href={`/${locale}/checkout`}
        className="mt-4 block w-full text-center bg-gray-900 text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800"
      >
        {t('proceedToCheckout')}
      </Link>
    </div>
  );
}

function QuantityStepper({ quantity, onChange }) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
      >
        −
      </button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <button
        onClick={() => onChange(quantity + 1)}
        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50"
      >
        +
      </button>
    </div>
  );
}
