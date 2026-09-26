"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { getOrderById, cancelOrder, requestReturn } from "@/lib/api/checkout";
import { formatPrice, formatDate } from "@/lib/format";
import AccountNav from "@/components/account/AccountNav";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

const CANCELLABLE = ["pending", "confirmed", "processing"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);

  const load = () => {
    setLoading(true);
    getOrderById(id)
      .then((res) => setOrder(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setActionError("");
    try {
      await cancelOrder(id, "Customer requested cancellation");
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Couldn't cancel this order.");
    }
  };

  if (loading) return <main className="p-8 text-gray-500">Loading…</main>;
  if (!order) return <main className="p-8 text-gray-500">Order not found.</main>;

  const canCancel = CANCELLABLE.includes(order.status);
  const canReturn = order.status === "delivered" && !order.Return;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Account</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="flex flex-col gap-6 md:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h2>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {order.StatusHistory?.length > 0 && (
              <ol className="mt-6 flex flex-col gap-3 border-s-2 border-gray-100 ps-4">
                {order.StatusHistory.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -start-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                    <p className="text-sm font-medium capitalize text-gray-900">{h.status.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-500">{formatDate(h.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}

            {order.trackingNumber && (
              <p className="mt-4 text-sm text-gray-600">
                Tracking: <span className="font-medium">{order.trackingNumber}</span>{" "}
                {order.courierName && `(${order.courierName})`}
              </p>
            )}

            {actionError && <p className="mt-3 text-sm text-danger">{actionError}</p>}

            <div className="mt-4 flex gap-3">
              {canCancel && (
                <button onClick={handleCancel} className="btn-outline text-sm">
                  Cancel Order
                </button>
              )}
              {canReturn && (
                <button onClick={() => setShowReturnForm((v) => !v)} className="btn-outline text-sm">
                  Request Return
                </button>
              )}
            </div>

            {showReturnForm && (
              <ReturnForm order={order} onSubmitted={() => { setShowReturnForm(false); load(); }} />
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Items</h2>
            <ul className="flex flex-col gap-3">
              {order.OrderItems?.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.productNameSnapshot} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">{formatPrice(item.paidUnitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-1 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {order.Address && (
            <div className="card p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Shipping Address</h2>
              <p className="text-sm text-gray-600">
                {order.Address.street}, {order.Address.area}, {order.Address.city}, {order.Address.country}
              </p>
            </div>
          )}

          <Link href="/account/orders" className="text-sm text-primary-600 hover:underline">
            ← Back to orders
          </Link>
        </div>
      </div>
    </main>
  );
}

function ReturnForm({ order, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggle = (itemId, quantity) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[itemId]) delete next[itemId];
      else next[itemId] = quantity;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsReturned = Object.entries(selected).map(([orderItemId, quantity]) => ({ orderItemId, quantity }));
    if (!itemsReturned.length) {
      setError("Select at least one item to return.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await requestReturn(order.id, { itemsReturned, reason });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your return request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-900">Select items to return</p>
      {order.OrderItems?.map((item) => (
        <label key={item.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggle(item.id, item.quantity)} />
          {item.productNameSnapshot} × {item.quantity}
        </label>
      ))}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are you returning this?"
        className="input"
        rows={2}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary self-start text-sm">
        {submitting ? "Submitting…" : "Submit return request"}
      </button>
    </form>
  );
}
