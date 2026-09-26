import { Link } from "@/lib/i18n/navigation";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product, locale = "en" }) {
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const image = product.images?.[0]?.url;
  const hasSale = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">No image</div>
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(hasSale ? product.salePrice : product.price)}
            </span>
            {hasSale && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.avgRating > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <span aria-hidden="true">★</span>
              <span>{parseFloat(product.avgRating).toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}
          {product.stock <= 0 && <p className="mt-1 text-xs font-medium text-red-600">Out of stock</p>}
        </div>
      </Link>
    </article>
  );
}
