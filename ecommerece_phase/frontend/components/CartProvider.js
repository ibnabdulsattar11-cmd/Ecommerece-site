"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function CartProvider({ children }) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    // Wait for the auth check to settle first — a logged-in user's cart
    // and a guest cart are different carts on the backend.
    if (!isLoading) fetchCart();
  }, [isLoading, fetchCart]);

  return children;
}
