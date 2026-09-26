"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "@/lib/i18n/navigation";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadProductImages,
  adminGetCategories,
} from "@/lib/api/admin";

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = !!product;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || { status: "draft" },
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(product?.images?.map((i) => i.url) || []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGetCategories().then((res) => setCategories(res.data || []));
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await adminUploadProductImages(files);
      setImages((prev) => [...prev, ...(res.data || [])]);
    } catch (err) {
      setError("Couldn't upload images.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...values, images };
      if (isEdit) {
        await adminUpdateProduct(product.id, payload);
      } else {
        await adminCreateProduct(payload);
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save this product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="card grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <div>
          <label className="label">Name (English)</label>
          <input {...register("nameEn", { required: true })} className="input" />
          {errors.nameEn && <p className="mt-1 text-xs text-danger">Required</p>}
        </div>
        <div>
          <label className="label">Name (Arabic)</label>
          <input {...register("nameAr", { required: true })} className="input" />
        </div>
        <div>
          <label className="label">SKU</label>
          <input {...register("sku", { required: true })} className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <select {...register("categoryId", { required: true })} className="input">
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameEn}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price</label>
          <input type="number" step="0.01" {...register("price", { required: true })} className="input" />
        </div>
        <div>
          <label className="label">Sale Price (optional)</label>
          <input type="number" step="0.01" {...register("salePrice")} className="input" />
        </div>
        <div>
          <label className="label">Stock</label>
          <input type="number" {...register("stock", { required: true })} className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register("status")} className="input">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div>
          <label className="label">Brand</label>
          <input {...register("brand")} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description (English)</label>
          <textarea {...register("descriptionEn")} rows={4} className="input" />
        </div>
      </div>

      <div className="card p-6">
        <label className="label">Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-sm" />
        {uploading && <p className="mt-2 text-xs text-gray-500">Uploading…</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute end-0 top-0 bg-black/60 px-1 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
