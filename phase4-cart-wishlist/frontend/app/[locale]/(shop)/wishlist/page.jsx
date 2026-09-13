'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistPage() {
  const locale = useLocale();
  const t = useTranslations('wishlist');
  const isAr = locale === 'ar';

  const { items, loading, loadWishlist, moveItemToCart, toggle } = useWishlistStore();

  useEffect(() => {
    loadWishlist();
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
          {t('browseProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(({ id, product }) => {
          const name = isAr ? product.nameAr : product.nameEn;
          const image = product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '/placeholder.png';
          const outOfStock = product.stock <= 0;

          return (
            <div key={id} className="flex gap-3 border border-gray-200 rounded-xl p-3">
              <Link href={`/${locale}/products/${product.slug}`} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <Image src={image} alt={name} fill className="object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/${locale}/products/${product.slug}`} className="text-sm font-medium text-gray-900 line-clamp-1">
                  {name}
                </Link>
                <p className="text-sm text-gray-700 mt-1">
                  {t('currency')} {parseFloat(product.salePrice || product.price).toFixed(2)}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => moveItemToCart(product.id)}
                    disabled={outOfStock}
                    className="text-xs bg-gray-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-40"
                  >
                    {outOfStock ? t('outOfStock') : t('moveToCart')}
                  </button>
                  <button
                    onClick={() => toggle(product.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
