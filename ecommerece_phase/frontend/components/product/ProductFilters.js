"use client";

import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Category</h2>
        <ul className="flex flex-col gap-1 text-sm">
          <li>
            <button
              onClick={() => updateParam("category", "")}
              className={`text-left ${!currentCategory ? "font-semibold text-primary" : "text-gray-600"}`}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam("category", cat.slug)}
                className={`text-left ${currentCategory === cat.slug ? "font-semibold text-primary" : "text-gray-600"}`}
              >
                {cat.nameEn}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Sort by</h2>
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full rounded border px-2 py-1.5 text-sm"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Availability</h2>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "true"}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : "")}
          />
          In stock only
        </label>
      </div>
    </div>
  );
}
