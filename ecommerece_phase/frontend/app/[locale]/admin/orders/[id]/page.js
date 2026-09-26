"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminGetOrders, adminUpdateOrderStatus } from "@/lib/api/admin";
import { formatPrice, formatDate } from "@/lib/format";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

const NEXT_STATUS = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered: [],
  return_requested: ["returned", "delivered"],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    // No single admin get-by-id endpoint was in scope; reuse the list with a large limit.
    adminGetOrders({ limit: 200 })
      .then((res) => setOrder((res.data || []).find((o) => o.id === id) || null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const updateStatus = async (status) => {
    setSaving(true);
    try {
      await adminUpdateOrderStatus(id, { status, trackingNumber, courierName });
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!order) return <p className="text-gray-500">Order not found.</p>;

  const nextOptions = NEXT_STATUS[order.status] || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {order.OrderItems?.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.productNameSnapshot} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.paidUnitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Update Status</h2>
            {nextOptions.length === 0 ? (
              <p className="text-sm text-gray-500">No further transitions available.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking number"
                  className="input"
                />
                <input
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Courier name"
                  className="input"
                />
                <div className="flex flex-wrap gap-2">
                  {nextOptions.map((s) => (
                    <button
                      key={s}
                      disabled={saving}
                      onClick={() => updateStatus(s)}
                      className="btn-outline text-xs capitalize"
                    >
                      Mark {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {order.Address && (
            <div className="card p-5">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Shipping Address</h2>
              <p className="text-sm text-gray-600">
                {order.Address.street}, {order.Address.area}, {order.Address.city}, {order.Address.country}
              </p>
            </div>
          )}

          <div className="card p-5 text-sm text-gray-600">
            <p>Placed: {formatDate(order.createdAt)}</p>
            <p>Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
