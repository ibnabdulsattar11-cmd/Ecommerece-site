import axios from '@/lib/axios';

/**
 * Fetch paginated/filtered product list.
 * params: { page, limit, search, category, minPrice, maxPrice, brand, sort, inStock }
 */
export async function getProducts(params = {}) {
  const { data } = await axios.get('/products', { params });
  return data; // { success, data: [...], pagination }
}

export async function getProductBySlug(slug) {
  const { data } = await axios.get(`/products/${slug}`);
  return data; // { success, data, related, recommended }
}

export async function getFilterMeta() {
  const { data } = await axios.get('/products/filters/meta');
  return data; // { success, data: { brands, priceRange } }
}

export async function getRecentlyViewed(ids = []) {
  if (!ids.length) return { success: true, data: [] };
  const { data } = await axios.get('/products/recently-viewed', {
    params: { ids: ids.join(',') },
  });
  return data;
}

export async function getCategories(tree = false) {
  const { data } = await axios.get('/categories', { params: { tree } });
  return data;
}

// --- Recently viewed tracking (client-side, localStorage) ---
const RECENT_KEY = 'recently_viewed_products';
const MAX_RECENT = 12;

export function trackRecentlyViewed(productId) {
  if (typeof window === 'undefined') return;
  let ids = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  ids = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
}

export function getRecentlyViewedIds() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
}
