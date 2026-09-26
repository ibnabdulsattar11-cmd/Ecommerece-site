"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "@/lib/i18n/navigation";
import { getMyOrders } from "@/lib/api/checkout";
import { formatPrice, formatDate } from "@/lib/format";
import AccountNav from "@/components/account/AccountNav";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default function OrdersPage() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      getMyOrders()
        .then((res) => setOrders(res.data || []))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Account</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Orders</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-14 text-center">
              <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
              <Link href="/products" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="card flex flex-col gap-2 p-4 transition hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
