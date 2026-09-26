import api from "@/lib/axios";

export async function validateCoupon(code) {
  const { data } = await api.post("/coupons/validate", { code });
  return data;
}

export async function placeOrderCOD(payload) {
  const { data } = await api.post("/checkout/place-order", payload);
  return data;
}

export async function createPaymentIntent(payload) {
  const { data } = await api.post("/checkout/create-payment-intent", payload);
  return data;
}

export async function getMyOrders(params = {}) {
  const { data } = await api.get("/orders", { params });
  return data;
}

export async function getOrderById(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function getOrderByNumber(orderNumber) {
  const { data } = await api.get(`/orders/by-number/${orderNumber}`);
  return data;
}

export async function cancelOrder(id, reason) {
  const { data } = await api.post(`/orders/${id}/cancel`, { reason });
  return data;
}

export async function requestReturn(id, payload) {
  const { data } = await api.post(`/orders/${id}/return`, payload);
  return data;
}
