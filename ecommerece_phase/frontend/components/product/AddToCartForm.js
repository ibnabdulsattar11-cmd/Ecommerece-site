"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { addToWishlist } from "@/lib/api/wishlist";

export default function AddToCartForm({ product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [variantId, setVariantId] = useState(product.variants?.[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("idle"); // idle | adding | added | error

  const outOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    setStatus("adding");
    try {
      await addItem(product.id, quantity, variantId || undefined);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      await addToWishlist(product.id);
    } catch (err) {
      // no-op — button doesn't need to surface this
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {product.variants?.length > 0 && (
        <div>
          <label className="label" htmlFor="variant">
            Options
          </label>
          <select
            id="variant"
            value={variantId || ""}
            onChange={(e) => setVariantId(e.target.value)}
            className="input"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {[v.size, v.color].filter(Boolean).join(" / ")}
                {v.stock <= 0 ? " (out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="label mb-0" htmlFor="qty">
          Qty
        </label>
        <div className="flex items-center rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 border-x border-gray-300 py-2 text-center text-sm"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || status === "adding"}
          className="btn-primary flex-1"
        >
          {outOfStock ? "Out of Stock" : status === "adding" ? "Adding…" : status === "added" ? "Added ✓" : "Add to Cart"}
        </button>
        <button onClick={handleWishlist} className="btn-outline" aria-label="Add to wishlist">
          ♡
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-danger">
          Couldn&apos;t add this to your cart. Please try again.
        </p>
      )}
    </div>
  );
}
