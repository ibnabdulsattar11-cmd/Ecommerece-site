'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getProducts } from '@/lib/api/products';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';

export default function ProductsPage() {
  const t = useTranslations('products');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Filters are derived straight from the URL so filtered views are shareable/bookmarkable
  const filters = Object.fromEntries(searchParams.entries());

  const updateFilters = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params.set(key, value);
      });
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    setLoading(true);
    getProducts({ ...filters, page: filters.page || 1, limit: 20 })
      .then((res) => {
        if (res.success) {
          setProducts(res.data);
          setPagination(res.pagination);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ ...filters, search: searchInput, page: 1 });
  };

  const goToPage = (page) => updateFilters({ ...filters, page });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
        />
        <button type="submit" className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800">
          {t('search')}
        </button>
      </form>

      <div className="flex flex-col sm:flex-row gap-6">
        <ProductFilters filters={filters} onChange={updateFilters} />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {t('resultsCount', { count: pagination.total })}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{t('noResults')}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => goToPage(pagination.page - 1)}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
                  >
                    {t('prev')}
                  </button>
                  <span className="text-sm text-gray-600">
                    {t('pageOf', { page: pagination.page, total: pagination.totalPages })}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => goToPage(pagination.page + 1)}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
