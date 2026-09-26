import { notFound } from "next/navigation";
import { getProductBySlugSSR } from "@/lib/api/products";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartForm from "@/components/product/AddToCartForm";
import ProductReviews from "@/components/product/ProductReviews";
import ProductCard from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchProduct(slug) {
  try {
    return await getProductBySlugSSR(slug);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const res = await fetchProduct(slug);
  if (!res) return { title: "Product not found" };

  const product = res.data;
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = (locale === "ar" ? product.descriptionAr : product.descriptionEn) || name;
  const image = product.images?.[0]?.url;
  const url = `${SITE_URL}/${locale}/products/${slug}`;

  return {
    title: `${name} | Shop`,
    description: description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      url,
      type: "website",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description.slice(0, 160),
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { locale, slug } = await params;
  const res = await fetchProduct(slug);
  if (!res) notFound();

  const product = res.data;
  const related = res.related || [];
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);
  const url = `${SITE_URL}/${locale}/products/${slug}`;

  // JSON-LD structured data — powers Google's rich product results
  // (price, availability, rating stars in search listings).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    image: product.images?.map((img) => img.url) || [],
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
      price: hasSale ? product.salePrice : product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/${locale}/products` },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.nameEn,
              item: `${SITE_URL}/${locale}/products?category=${product.category.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name, item: url },
    ],
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex flex-wrap gap-2">
          <li>
            <a href={`/${locale}`}>Home</a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a href={`/${locale}/products`}>Products</a>
          </li>
          {product.category && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <a href={`/${locale}/products?category=${product.category.slug}`}>
                  {product.category.nameEn}
                </a>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-gray-900">
            {name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images || []} name={name} />

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span aria-hidden="true" className="text-accent">
                {"★".repeat(Math.round(product.avgRating))}
                {"☆".repeat(5 - Math.round(product.avgRating))}
              </span>
              <span>
                {parseFloat(product.avgRating).toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(hasSale ? product.salePrice : product.price)}
            </span>
            {hasSale && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {description && <p className="mt-4 text-gray-600">{description}</p>}

          <div className="mt-6">
            <AddToCartForm product={product} />
          </div>

          {product.brand && (
            <p className="mt-6 text-sm text-gray-500">
              Brand: <span className="text-gray-700">{product.brand}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            SKU: <span className="text-gray-700">{product.sku}</span>
          </p>
        </div>
      </div>

      <ProductReviews productId={product.id} initialBreakdown={res.breakdown} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-bold text-gray-900">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
