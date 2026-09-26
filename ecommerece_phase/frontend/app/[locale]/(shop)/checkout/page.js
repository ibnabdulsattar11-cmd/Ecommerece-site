"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { validateCoupon, placeOrderCOD, createPaymentIntent } from "@/lib/api/checkout";
import { formatPrice } from "@/lib/format";
import AddressSelector from "@/components/checkout/AddressSelector";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);

  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);

  const subtotal = cart?.subtotal || 0;
  const discount = couponResult?.discount || 0;

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await validateCoupon(couponCode.trim());
      setCouponResult(res.data);
    } catch (err) {
      setCouponResult(null);
      setCouponError(err.response?.data?.message || "Invalid coupon");
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressId) {
      setOrderError("Please select or add a shipping address.");
      return;
    }
    setPlacing(true);
    setOrderError("");

    try {
      if (paymentMethod === "cod") {
        const res = await placeOrderCOD({ addressId, couponCode: couponResult?.code });
        router.push(`/checkout/success?order=${res.data.orderNumber}`);
      } else {
        const res = await createPaymentIntent({ addressId, couponCode: couponResult?.code });
        setClientSecret(res.data.clientSecret);
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || "Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty — nothing to check out.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Shipping Address</h2>
            <AddressSelector selectedId={addressId} onSelect={setAddressId} />
          </section>

          {!clientSecret && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Payment Method</h2>
              <div className="flex gap-3">
                <label className={`card flex-1 cursor-pointer p-4 text-sm ${paymentMethod === "cod" ? "border-primary-500 ring-1 ring-primary-500" : ""}`}>
                  <input type="radio" name="pm" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="me-2" />
                  Cash on Delivery
                </label>
                <label className={`card flex-1 cursor-pointer p-4 text-sm ${paymentMethod === "stripe" ? "border-primary-500 ring-1 ring-primary-500" : ""}`}>
                  <input type="radio" name="pm" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="me-2" />
                  Credit / Debit Card
                </label>
              </div>
            </section>
          )}

          {clientSecret && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Pay with card</h2>
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={() => router.push("/checkout/success")}
              />
            </section>
          )}
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="input"
            />
            <button onClick={applyCoupon} className="btn-outline whitespace-nowrap text-xs">
              Apply
            </button>
          </div>
          {couponError && <p className="mt-1 text-xs text-danger">{couponError}</p>}
          {couponResult && <p className="mt-1 text-xs text-success">Coupon applied: -{formatPrice(discount)}</p>}

          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Calculated on placing order</span>
            </div>
          </div>

          {orderError && <p className="mt-3 text-sm text-danger">{orderError}</p>}

          {!clientSecret && (
            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary mt-5 w-full">
              {placing ? "Placing order…" : paymentMethod === "cod" ? "Place Order" : "Continue to Payment"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
