"use client";

import { useEffect } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = cart?.items || [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <ul className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </ul>

          <div className="card h-fit p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Summary</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span className="font-medium text-gray-900">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Shipping and taxes calculated at checkout.</p>
            <Link href="/checkout" className="btn-primary mt-5 w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function CartLineItem({ item, onUpdate, onRemove }) {
  const product = item.product;
  const unitPrice = parseFloat(product?.salePrice || product?.price || 0) + parseFloat(item.variant?.priceModifier || 0);

  return (
    <li className="card flex gap-4 p-4">
      <Link href={`/products/${product?.slug}`} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product?.images?.[0]?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt={product.nameEn} className="h-full w-full object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${product?.slug}`} className="text-sm font-medium text-gray-900 hover:underline">
            {product?.nameEn}
          </Link>
          {item.variant && (
            <p className="text-xs text-gray-500">
              {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-primary-600">{formatPrice(unitPrice)}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              className="px-2.5 py-1 text-gray-600 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button onClick={() => onRemove(item.id)} className="text-xs text-danger hover:underline">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
