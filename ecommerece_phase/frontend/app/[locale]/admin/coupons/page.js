"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon, adminUpdateCoupon } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/format";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { type: "percentage" } });

  const load = () => {
    setLoading(true);
    adminGetCoupons()
      .then((res) => setCoupons(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (values) => {
    await adminCreateCoupon({ ...values, value: parseFloat(values.value), minOrder: parseFloat(values.minOrder || 0) });
    reset({ type: "percentage" });
    load();
  };

  const toggleActive = async (coupon) => {
    await adminUpdateCoupon(coupon.id, { isActive: !coupon.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await adminDeleteCoupon(id);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Coupons</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">New Coupon</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <input {...register("code", { required: true })} placeholder="CODE" className="input uppercase" />
            <select {...register("type")} className="input">
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <input type="number" step="0.01" {...register("value", { required: true })} placeholder="Value" className="input" />
            <input type="number" step="0.01" {...register("minOrder")} placeholder="Minimum order (optional)" className="input" />
            <input type="date" {...register("expiryDate", { required: true })} className="input" />
            <button type="submit" className="btn-primary">Create Coupon</button>
          </form>
        </div>

        <div className="card overflow-x-auto lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start">Code</th>
                <th className="px-4 py-3 text-start">Value</th>
                <th className="px-4 py-3 text-start">Expires</th>
                <th className="px-4 py-3 text-start">Used</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading…</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.type === "percentage" ? `${c.value}%` : formatPrice(c.value)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.expiryDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${c.isActive ? "bg-success-light text-success" : "bg-gray-100 text-gray-600"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => toggleActive(c)} className="text-primary-600 hover:underline">
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
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
