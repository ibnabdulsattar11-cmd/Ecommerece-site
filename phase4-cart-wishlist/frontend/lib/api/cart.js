import axios from '@/lib/axios';

// axios instance must have { withCredentials: true } set globally so the
// guest_cart_token httpOnly cookie is sent/received correctly.

export async function fetchCart() {
  const { data } = await axios.get('/cart');
  return data; // { success, data: { id, items, subtotal, itemCount } }
}

export async function addCartItem({ productId, variantId, quantity = 1 }) {
  const { data } = await axios.post('/cart/items', { productId, variantId, quantity });
  return data;
}

export async function updateCartItem(itemId, quantity) {
  const { data } = await axios.put(`/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId) {
  const { data } = await axios.delete(`/cart/items/${itemId}`);
  return data;
}

export async function clearCart() {
  const { data } = await axios.delete('/cart');
  return data;
}

// Call right after a successful login/register so guest-cart items
// carry over into the user's account cart.
export async function mergeCart() {
  const { data } = await axios.post('/cart/merge');
  return data;
}
