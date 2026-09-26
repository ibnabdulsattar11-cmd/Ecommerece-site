"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { adminGetProducts, adminDeleteProduct } from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminGetProducts({ search, limit: 50 })
      .then((res) => setProducts(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await adminDeleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search products…"
          className="input max-w-sm"
        />
        <button onClick={load} className="btn-outline">Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-start text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-start">SKU</th>
              <th className="px-4 py-3 text-start">Price</th>
              <th className="px-4 py-3 text-start">Stock</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nameEn}</td>
                  <td className="px-4 py-3 text-gray-600">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(p.salePrice || p.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.status === "active" ? "bg-success-light text-success" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-primary-600 hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="text-danger hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
