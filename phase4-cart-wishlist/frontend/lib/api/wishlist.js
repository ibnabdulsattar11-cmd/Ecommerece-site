import axios from '@/lib/axios';

export async function fetchWishlist() {
  const { data } = await axios.get('/wishlist');
  return data; // { success, data: [{ id, product, ... }] }
}

export async function addToWishlist(productId) {
  const { data } = await axios.post('/wishlist', { productId });
  return data;
}

export async function removeFromWishlist(productId) {
  const { data } = await axios.delete(`/wishlist/${productId}`);
  return data;
}

export async function moveToCart(productId, { variantId, quantity = 1 } = {}) {
  const { data } = await axios.post(`/wishlist/${productId}/move-to-cart`, { variantId, quantity });
  return data;
}
