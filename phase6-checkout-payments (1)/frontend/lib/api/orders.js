import axios from '@/lib/axios';

export async function validateCoupon(code, subtotal) {
  const { data } = await axios.post('/coupons/validate', { code, subtotal });
  return data; // { success, data: { valid, code, discount } }
}

export async function getMyOrders(page = 1) {
  const { data } = await axios.get('/orders', { params: { page } });
  return data;
}

export async function getOrderById(id) {
  const { data } = await axios.get(`/orders/${id}`);
  return data;
}

export async function getOrderByNumber(orderNumber) {
  const { data } = await axios.get(`/orders/by-number/${orderNumber}`);
  return data;
}
