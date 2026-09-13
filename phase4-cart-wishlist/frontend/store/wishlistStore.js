import { create } from 'zustand';
import { fetchWishlist, addToWishlist, removeFromWishlist, moveToCart } from '@/lib/api/wishlist';
import { useCartStore } from './cartStore';

export const useWishlistStore = create((set, get) => ({
  items: [], // [{ id, product }]
  loading: false,

  loadWishlist: async () => {
    set({ loading: true });
    try {
      const res = await fetchWishlist();
      if (res.success) set({ items: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  isWishlisted: (productId) => get().items.some((i) => i.product?.id === productId || i.productId === productId),

  toggle: async (productId) => {
    const already = get().isWishlisted(productId);
    if (already) {
      await removeFromWishlist(productId);
      set({ items: get().items.filter((i) => (i.product?.id || i.productId) !== productId) });
    } else {
      const res = await addToWishlist(productId);
      if (res.success) {
        // refresh from server so we get the joined product data
        get().loadWishlist();
      }
    }
  },

  moveItemToCart: async (productId, options) => {
    const res = await moveToCart(productId, options);
    if (res.success) {
      set({ items: get().items.filter((i) => (i.product?.id || i.productId) !== productId) });
      // cart store already reflects the merged item from the response
      useCartStore.setState({ ...res.data });
    }
    return res;
  },
}));
