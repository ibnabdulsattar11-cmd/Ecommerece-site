const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch helper for Server Components / generateMetadata / sitemap.
 * Uses Next's fetch cache (revalidate) instead of axios, since this runs
 * at request/build time on the server, not in the browser — no auth
 * token, no interceptors needed for public storefront data.
 */
export async function serverFetch(path, { revalidate = 60, ...init } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    next: { revalidate },
  });

  if (!res.ok) {
    const error = new Error(`Request failed: ${res.status} ${path}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}
