import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { getProductsSSR } from "@/lib/api/products";
import { getCategoriesSSR } from "@/lib/api/categories";
import ProductCard from "@/components/product/ProductCard";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const [featuredRes, categoriesRes] = await Promise.all([
    getProductsSSR({ limit: 8, sort: "popular" }).catch(() => ({ data: [] })),
    getCategoriesSSR().catch(() => ({ data: [] })),
  ]);

  const featured = featuredRes.data || [];
  const categories = (categoriesRes.data || []).slice(0, 6);

  return (
    <main>
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t("heroTitle")}</h1>
          <p className="max-w-xl text-lg text-primary-100">{t("heroSubtitle")}</p>
          <Link href="/products" className="btn-accent mt-4 !px-8 !py-3 text-base">
            {t("shopNow")}
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="card group flex flex-col items-center gap-2 p-4 text-center transition hover:shadow-card-hover"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-xl text-primary-600 group-hover:bg-primary-100">
                  {cat.nameEn?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {locale === "ar" ? cat.nameAr : cat.nameEn}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Popular Right Now</h2>
            <Link href="/products" className="text-sm font-medium text-primary-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
