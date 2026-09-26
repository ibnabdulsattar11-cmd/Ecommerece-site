import api from "@/lib/axios";

export async function getWishlist() {
  const { data } = await api.get("/wishlist");
  return data;
}

export async function addToWishlist(productId) {
  const { data } = await api.post("/wishlist", { productId });
  return data;
}

export async function removeFromWishlist(productId) {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
}

export async function moveWishlistItemToCart(productId, payload = {}) {
  const { data } = await api.post(`/wishlist/${productId}/move-to-cart`, payload);
  return data;
}
