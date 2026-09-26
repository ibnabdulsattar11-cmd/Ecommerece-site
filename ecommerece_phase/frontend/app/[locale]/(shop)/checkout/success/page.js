"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { getOrderByNumber } from "@/lib/api/checkout";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/format";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderNumber);

  useEffect(() => {
    fetchCart(); // refresh navbar badge — cart was cleared server-side
    if (orderNumber) {
      getOrderByNumber(orderNumber)
        .then((res) => setOrder(res.data))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mb-4 text-5xl">✅</div>
      <h1 className="text-2xl font-bold text-gray-900">Thank you for your order!</h1>
      <p className="mt-2 text-gray-600">
        {orderNumber ? `Order #${orderNumber} has been placed successfully.` : "Your order has been placed."}
      </p>

      {loading && <p className="mt-6 text-sm text-gray-400">Loading order details…</p>}

      {order && (
        <div className="card mt-8 p-6 text-start">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order total</span>
            <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-gray-600">
            <span>Payment method</span>
            <span className="uppercase">{order.paymentMethod}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-gray-600">
            <span>Status</span>
            <span className="capitalize">{order.status?.replace(/_/g, " ")}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products" className="btn-outline">
          Continue Shopping
        </Link>
        <Link href="/account/orders" className="btn-primary">
          View My Orders
        </Link>
      </div>
    </main>
  );
}
