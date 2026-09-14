import axios from '@/lib/axios';

export async function getCheckoutSummary(addressId, couponCode) {
  const { data } = await axios.get('/checkout/summary', { params: { addressId, couponCode } });
  return data; // { success, data: { items, subtotal, discount, shipping, tax, total, estimatedDays } }
}

export async function createPaymentIntent(addressId, couponCode) {
  const { data } = await axios.post('/checkout/create-payment-intent', { addressId, couponCode });
  return data; // { success, data: { orderId, orderNumber, total, clientSecret } }
}

export async function placeOrderCOD(addressId, couponCode) {
  const { data } = await axios.post('/checkout/place-order', { addressId, couponCode });
  return data; // { success, data: { orderId, orderNumber, total } }
}
