'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';

/**
 * Usage in the Phase 3 product detail page — replace the static
 * "Add to Cart" <button> with:
 *
 *   <AddToCartButton
 *     productId={product.id}
 *     variantId={selectedVariant?.id}
 *     inStock={inStock}
 *   />
 */
export default function AddToCartButton({ productId, variantId, inStock }) {
  const t = useTranslations('cart');
  const addItem = useCartStore((s) => s.addItem);
  const [status, setStatus] = useState('idle'); // idle | loading | added | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleClick = async () => {
    setStatus('loading');
    const res = await addItem(productId, variantId, 1);
    if (res.success) {
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1500);
    } else {
      setStatus('error');
      setErrorMsg(res.message || '');
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={!inStock || status === 'loading'}
        className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
      >
        {status === 'loading' ? t('adding') : status === 'added' ? t('added') : t('addToCart')}
      </button>
      {status === 'error' && <p className="text-xs text-red-500 mt-1">{errorMsg}</p>}
    </div>
  );
}
