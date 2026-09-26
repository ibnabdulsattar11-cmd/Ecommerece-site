import { getProductsSSR } from "@/lib/api/products";
import { getCategoriesSSR } from "@/lib/api/categories";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import Pagination from "@/components/ui/Pagination";

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  const category = sp.category;

  const title = category
    ? `${category[0].toUpperCase()}${category.slice(1)} — Shop`
    : sp.search
      ? `Search: ${sp.search} — Shop`
      : "All Products — Shop";
  const description = category
    ? `Browse our ${category} collection — quality products, fast delivery.`
    : "Browse our full catalog of quality products with fast delivery.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/products${category ? `?category=${category}` : ""}`,
    },
    openGraph: { title, description, type: "website" },
  };
}

export default async function ProductsPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;

  const page = parseInt(sp.page) || 1;
  const queryParams = {
    page,
    limit: 24,
    ...(sp.category && { category: sp.category }),
    ...(sp.search && { search: sp.search }),
    ...(sp.minPrice && { minPrice: sp.minPrice }),
    ...(sp.maxPrice && { maxPrice: sp.maxPrice }),
    ...(sp.sort && { sort: sp.sort }),
    ...(sp.inStock && { inStock: sp.inStock }),
  };

  const [productsRes, categoriesRes] = await Promise.all([
    getProductsSSR(queryParams).catch(() => ({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } })),
    getCategoriesSSR().catch(() => ({ data: [] })),
  ]);

  const products = productsRes.data || [];
  const pagination = productsRes.pagination || { page: 1, totalPages: 1 };
  const categories = categoriesRes.data || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
        <ol className="flex gap-2">
          <li>
            <a href={`/${locale}`}>Home</a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900">
            Products
          </li>
        </ol>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {sp.category ? `${sp.category}` : sp.search ? `Results for "${sp.search}"` : "All Products"}
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <ProductFilters categories={categories} searchParams={sp} />
        </aside>

        <section className="lg:col-span-3">
          {products.length === 0 ? (
            <p className="py-16 text-center text-gray-500">No products found.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">{pagination.total} products</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
