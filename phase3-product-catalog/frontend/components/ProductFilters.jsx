'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getFilterMeta } from '@/lib/api/products';

/**
 * Controlled filter panel. Parent (products page) owns the actual
 * `filters` state and passes it down + a setter, so the URL/query
 * string stays the single source of truth for shareable filtered links.
 */
export default function ProductFilters({ filters, onChange }) {
  const t = useTranslations('products');
  const [meta, setMeta] = useState({ brands: [], priceRange: { minPrice: 0, maxPrice: 1000 } });
  const [localMin, setLocalMin] = useState(filters.minPrice || '');
  const [localMax, setLocalMax] = useState(filters.maxPrice || '');

  useEffect(() => {
    getFilterMeta().then((res) => {
      if (res.success) setMeta(res.data);
    });
  }, []);

  const toggleBrand = (brand) => {
    const current = filters.brand ? filters.brand.split(',') : [];
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...filters, brand: next.join(','), page: 1 });
  };

  const applyPrice = () => {
    onChange({ ...filters, minPrice: localMin || undefined, maxPrice: localMax || undefined, page: 1 });
  };

  const selectedBrands = filters.brand ? filters.brand.split(',') : [];

  return (
    <aside className="w-full sm:w-64 shrink-0 space-y-6">
      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('sortBy')}</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">{t('sort.newest')}</option>
          <option value="price_asc">{t('sort.priceAsc')}</option>
          <option value="price_desc">{t('sort.priceDesc')}</option>
          <option value="rating">{t('sort.rating')}</option>
          <option value="popular">{t('sort.popular')}</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceRange')}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={String(meta.priceRange.minPrice ?? 0)}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder={String(meta.priceRange.maxPrice ?? 1000)}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={applyPrice}
          className="mt-2 text-sm text-white bg-gray-900 rounded-lg px-3 py-1.5 hover:bg-gray-800"
        >
          {t('apply')}
        </button>
      </div>

      {/* Brand */}
      {meta.brands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('brand')}</label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {meta.brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-gray-300"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* In stock only */}
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => onChange({ ...filters, inStock: e.target.checked ? 'true' : undefined, page: 1 })}
            className="rounded border-gray-300"
          />
          {t('inStockOnly')}
        </label>
      </div>
    </aside>
  );
}
