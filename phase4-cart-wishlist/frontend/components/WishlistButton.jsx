'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * Heart-icon toggle. Drop into ProductCard.jsx (top-end corner, absolute
 * positioned) or the product detail page next to the title.
 *
 *   <WishlistButton productId={product.id} />
 */
export default function WishlistButton({ productId, className = '' }) {
  const { items, isWishlisted, toggle, loadWishlist } = useWishlistStore();

  useEffect(() => {
    // only fetch once per session; harmless if called again
    if (items.length === 0) loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = isWishlisted(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // don't trigger a parent <Link> navigation
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label="Toggle wishlist"
      className={`rounded-full p-1.5 bg-white/90 hover:bg-white shadow-sm transition-colors ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? '#dc2626' : 'none'}
        stroke={active ? '#dc2626' : '#6b7280'}
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M12 21s-6.7-4.35-9.3-8.1C.9 10.1 1.5 6.5 4.6 5.1c2.2-1 4.6-.3 5.9 1.4.4.5.9 1.1 1.5 1.9.6-.8 1.1-1.4 1.5-1.9 1.3-1.7 3.7-2.4 5.9-1.4 3.1 1.4 3.7 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
