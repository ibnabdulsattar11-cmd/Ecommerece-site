"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { adminGetCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from "@/lib/api/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = () => {
    setLoading(true);
    adminGetCategories()
      .then((res) => setCategories(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (values) => {
    if (editing) {
      await adminUpdateCategory(editing.id, values);
    } else {
      await adminCreateCategory(values);
    }
    reset();
    setEditing(null);
    load();
  };

  const startEdit = (cat) => {
    setEditing(cat);
    reset({ nameEn: cat.nameEn, nameAr: cat.nameAr, slug: cat.slug, sortOrder: cat.sortOrder });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    await adminDeleteCategory(id);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categories</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            {editing ? "Edit Category" : "New Category"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <input {...register("nameEn", { required: true })} placeholder="Name (English)" className="input" />
            <input {...register("nameAr", { required: true })} placeholder="Name (Arabic)" className="input" />
            <input {...register("slug", { required: true })} placeholder="Slug" className="input" />
            <input type="number" {...register("sortOrder")} placeholder="Sort order" className="input" />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? "Save" : "Create"}</button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); reset({}); }} className="btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start">Name</th>
                <th className="px-4 py-3 text-start">Slug</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Loading…</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.nameEn}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(c)} className="text-primary-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="text-danger hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
