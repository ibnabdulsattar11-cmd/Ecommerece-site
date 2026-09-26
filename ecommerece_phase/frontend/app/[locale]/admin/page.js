"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { getDashboard } from "@/lib/api/admin";
import { formatPrice, formatDate } from "@/lib/format";
import StatCard from "@/components/admin/StatCard";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard(30)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard…</p>;
  if (!data) return <p className="text-gray-500">Couldn&apos;t load dashboard data.</p>;

  const { summary, topProducts, recentOrders, lowStockProducts } = data;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(summary.totalRevenue)} tone="success" />
        <StatCard label="Orders" value={summary.orderCount} />
        <StatCard label="Customers" value={summary.customersCount} hint={`+${summary.newCustomersThisWeek} this week`} />
        <StatCard
          label="Low Stock"
          value={summary.lowStockCount}
          tone={summary.lowStockCount > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div className="flex flex-col gap-2">
            {recentOrders?.length ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
                >
                  <span>
                    #{order.orderNumber} — {order.User?.name || "Guest"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatPrice(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Top Products</h2>
          <div className="flex flex-col gap-2">
            {topProducts?.length ? (
              topProducts.map((row) => (
                <div key={row.product?.id} className="flex items-center justify-between px-2 py-2 text-sm">
                  <span>{row.product?.nameEn || "—"}</span>
                  <span className="text-gray-500">{row.unitsSold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      {lowStockProducts?.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Low Stock Alert</h2>
          <div className="flex flex-col gap-2">
            {lowStockProducts.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                <span>{p.nameEn}</span>
                <span className="font-medium text-danger">{p.stock} left</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
