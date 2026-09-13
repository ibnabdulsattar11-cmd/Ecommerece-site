'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

export default function ProductCard({ product }) {
  const locale = useLocale();
  const t = useTranslations('products');
  const isAr = locale === 'ar';

  const name = isAr ? product.nameAr : product.nameEn;
  const image = product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '/placeholder.png';
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={image}
          alt={isAr ? product.images?.[0]?.altTextAr : product.images?.[0]?.altTextEn || name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {hasSale && (
          <span className="absolute top-2 start-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {t('sale')}
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-medium text-gray-700">
            {t('outOfStock')}
          </span>
        )}
      </div>

      <div className="p-3">
        {product.brand && (
          <p className="text-xs text-gray-500 mb-0.5">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{name}</h3>

        <div className="mt-2 flex items-center gap-2">
          {hasSale ? (
            <>
              <span className="text-base font-semibold text-red-600">
                {t('currency')} {parseFloat(product.salePrice).toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {t('currency')} {parseFloat(product.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900">
              {t('currency')} {parseFloat(product.price).toFixed(2)}
            </span>
          )}
        </div>

        {product.avgRating > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
            <span>★</span>
            <span className="text-gray-600">
              {parseFloat(product.avgRating).toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
