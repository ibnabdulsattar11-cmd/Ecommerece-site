"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductBySlug } from "@/lib/api/products";
import { adminGetProducts } from "@/lib/api/admin";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin listing includes drafts/inactive products by id lookup via search
    adminGetProducts({ limit: 200 })
      .then((res) => {
        const found = (res.data || []).find((p) => p.id === id);
        setProduct(found || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!product) return <p className="text-gray-500">Product not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
