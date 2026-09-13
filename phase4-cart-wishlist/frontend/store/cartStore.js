import { create } from 'zustand';
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
  mergeCart as mergeCartApi,
} from '@/lib/api/cart';

/**
 * Single source of truth for cart state across the app (header badge,
 * cart page, product detail "Add to Cart" button all read from here).
 * Every mutation calls the backend then replaces local state with the
 * server's response, so totals/stock checks always reflect the DB.
 */
export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: false,
  error: null,

  loadCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetchCart();
      if (res.success) set({ ...res.data, loading: false });
    } catch (err) {
      set({ loading: false, error: err?.response?.data?.message || 'Failed to load cart' });
    }
  },

  addItem: async (productId, variantId, quantity = 1) => {
    set({ error: null });
    try {
      const res = await addCartItem({ productId, variantId, quantity });
      if (res.success) set({ ...res.data });
      return res;
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add item';
      set({ error: message });
      return { success: false, message };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    // optimistic update for snappy UI, corrected by server response
    const prevItems = get().items;
    set({
      items: prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    });
    try {
      const res = await updateCartItem(itemId, quantity);
      if (res.success) set({ ...res.data });
      return res;
    } catch (err) {
      set({ items: prevItems, error: err?.response?.data?.message || 'Failed to update quantity' });
      return { success: false };
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await removeCartItem(itemId);
      if (res.success) set({ ...res.data });
      return res;
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to remove item' });
      return { success: false };
    }
  },

  clearCart: async () => {
    await clearCartApi();
    set({ items: [], subtotal: 0, itemCount: 0 });
  },

  // Call once, right after login/register succeeds
  mergeGuestCart: async () => {
    try {
      const res = await mergeCartApi();
      if (res.success) set({ ...res.data });
    } catch {
      // non-fatal — worst case guest items stay in the guest cookie cart
    }
  },
}));
