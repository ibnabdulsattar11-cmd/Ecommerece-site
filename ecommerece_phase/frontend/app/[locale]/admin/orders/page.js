"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { adminGetOrders } from "@/lib/api/admin";
import { formatPrice, formatDate } from "@/lib/format";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

const STATUSES = ["", "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "return_requested", "returned", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = () => {
    setLoading(true);
    adminGetOrders(status ? { status } : {})
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mb-4 max-w-xs">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>
        ))}
      </select>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-start">Order</th>
              <th className="px-4 py-3 text-start">Customer</th>
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Total</th>
              <th className="px-4 py-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No orders.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-600 hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.User?.name || "Guest"}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
