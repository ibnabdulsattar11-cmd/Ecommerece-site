import { getAllProductSlugsSSR } from "@/lib/api/products";
import { getCategoriesSSR } from "@/lib/api/categories";
import { routing } from "@/lib/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const entries = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      changeFrequency: "daily",
      priority: 1,
    });
    entries.push({
      url: `${SITE_URL}/${locale}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getAllProductSlugsSSR(),
      getCategoriesSSR(),
    ]);

    for (const product of productsRes.data || []) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/products/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    for (const category of categoriesRes.data || []) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/products?category=${category.slug}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    // Backend unreachable at build time — ship the static entries rather
    // than failing the whole build.
  }

  return entries;
}
