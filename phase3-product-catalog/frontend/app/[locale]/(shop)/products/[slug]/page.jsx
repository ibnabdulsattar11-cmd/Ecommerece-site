'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  getProductBySlug,
  getRecentlyViewed,
  getRecentlyViewedIds,
  trackRecentlyViewed,
} from '@/lib/api/products';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({ params }) {
  const { slug } = params;
  const locale = useLocale();
  const t = useTranslations('products');
  const isAr = locale === 'ar';

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        if (!res.success) return;
        setProduct(res.data);
        setRelated(res.related || []);
        setRecommended(res.recommended || []);
        setSelectedVariant(res.data.variants?.find((v) => v.isDefault) || res.data.variants?.[0] || null);

        trackRecentlyViewed(res.data.id);

        // hydrate recently viewed (excluding the product being viewed right now)
        const ids = getRecentlyViewedIds().filter((id) => id !== res.data.id);
        if (ids.length) {
          getRecentlyViewed(ids).then((r) => r.success && setRecentlyViewed(r.data));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">{t('loading')}</div>;
  }

  if (!product) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">{t('notFound')}</div>;
  }

  const name = isAr ? product.nameAr : product.nameEn;
  const description = isAr ? product.descAr : product.descEn;
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);
  const effectivePrice = parseFloat(product.price) + (selectedVariant ? parseFloat(selectedVariant.priceModifier || 0) : 0);
  const inStock = (selectedVariant ? selectedVariant.stock : product.stock) > 0;

  // group variants by color/size for simple selectors
  const colors = [...new Set(product.variants?.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
            <Image
              src={product.images?.[selectedImage]?.url || '/placeholder.png'}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${
                    i === selectedImage ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <Image src={img.thumbnailUrl || img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{name}</h1>

          {product.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-2 text-sm text-amber-500">
              <span>★</span>
              <span className="text-gray-600">
                {parseFloat(product.avgRating).toFixed(1)} ({product.reviewCount} {t('reviews')})
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            {hasSale ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  {t('currency')} {(effectivePrice - (parseFloat(product.price) - parseFloat(product.salePrice))).toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {t('currency')} {effectivePrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {t('currency')} {effectivePrice.toFixed(2)}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {inStock ? (
              <span className="text-green-600">{t('inStock')}</span>
            ) : (
              <span className="text-red-500">{t('outOfStock')}</span>
            )}
          </p>

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('color')}</p>
              <div className="flex gap-2">
                {colors.map((color) => {
                  const variant = product.variants.find((v) => v.color === color);
                  const isSelected = selectedVariant?.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-8 h-8 rounded-full border-2 ${isSelected ? 'border-gray-900' : 'border-gray-200'}`}
                      style={{ backgroundColor: variant?.colorHex || '#ccc' }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('size')}</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color)
                  );
                  const isSelected = selectedVariant?.size === size;
                  return (
                    <button
                      key={size}
                      onClick={() => variant && setSelectedVariant(variant)}
                      disabled={!variant || variant.stock <= 0}
                      className={`px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 ${
                        isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            disabled={!inStock}
            className="mt-6 w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40 hover:bg-gray-800"
          >
            {t('addToCart')}
          </button>

          {description && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('description')}</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <Section title={t('relatedProducts')} products={related} />
      )}

      {/* Recommended products */}
      {recommended.length > 0 && (
        <Section title={t('recommendedForYou')} products={recommended} />
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <Section title={t('recentlyViewed')} products={recentlyViewed} />
      )}
    </div>
  );
}

function Section({ title, products }) {
  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
