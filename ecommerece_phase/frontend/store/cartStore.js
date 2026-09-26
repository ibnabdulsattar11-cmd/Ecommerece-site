import { create } from "zustand";
import * as cartApi from "@/lib/api/cart";

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.getCart();
      set({ cart: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1, variantId) => {
    const { data } = await cartApi.addCartItem(productId, quantity, variantId);
    set({ cart: data });
    return data;
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await cartApi.updateCartItem(itemId, quantity);
    set({ cart: data });
    return data;
  },

  removeItem: async (itemId) => {
    const { data } = await cartApi.removeCartItem(itemId);
    set({ cart: data });
    return data;
  },

  clear: async () => {
    await cartApi.clearCart();
    set({ cart: { items: [], subtotal: 0, itemCount: 0 } });
  },

  itemCount: () => get().cart?.itemCount || 0,
}));
