"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { getWishlist, removeFromWishlist, moveWishlistItemToCart } from "@/lib/api/wishlist";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const load = () => {
    setLoading(true);
    getWishlist()
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleMoveToCart = async (productId) => {
    await moveWishlistItemToCart(productId, {});
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    fetchCart();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Wishlist</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item.id} className="card overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-100">
                    {product.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0].url} alt={product.nameEn} className="h-full w-full object-cover" />
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-gray-900">
                    {product.nameEn}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-primary-600">{formatPrice(product.salePrice || product.price)}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleMoveToCart(product.id)} className="btn-primary flex-1 !px-2 !py-1.5 text-xs">
                      Add to cart
                    </button>
                    <button onClick={() => handleRemove(product.id)} className="btn-outline !px-2 !py-1.5 text-xs" aria-label="Remove">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
