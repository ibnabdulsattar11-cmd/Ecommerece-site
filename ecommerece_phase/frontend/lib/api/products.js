import api from "@/lib/axios";
import { serverFetch } from "./server-fetch";

// ---- Server (Server Components, generateMetadata, sitemap) ----

export async function getProductsSSR(searchParams = {}) {
  const qs = new URLSearchParams(searchParams).toString();
  return serverFetch(`/products${qs ? `?${qs}` : ""}`, { revalidate: 60 });
}

export async function getProductBySlugSSR(slug) {
  return serverFetch(`/products/${slug}`, { revalidate: 60 });
}

export async function getAllProductSlugsSSR() {
  // Used by the sitemap — a light listing, large page size, slug+updatedAt only needed.
  return serverFetch(`/products?limit=1000`, { revalidate: 3600 });
}

// ---- Client (interactive pages: filters, search-as-you-type) ----

export async function getProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data;
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/${slug}`);
  return data;
}

export async function getProductReviews(productId, params = {}) {
  const { data } = await api.get(`/products/${productId}/reviews`, { params });
  return data;
}

export async function submitReview(productId, payload) {
  const { data } = await api.post(`/products/${productId}/reviews`, payload);
  return data;
}

export async function voteReviewHelpful(productId, reviewId, helpful) {
  const { data } = await api.post(`/products/${productId}/reviews/${reviewId}/helpful`, { helpful });
  return data;
}
