import api from "@/lib/axios";

// ---- Dashboard ----
export async function getDashboard(days = 30) {
  const { data } = await api.get("/admin/dashboard", { params: { days } });
  return data;
}

// ---- Products ----
export async function adminGetProducts(params = {}) {
  const { data } = await api.get("/products", { params: { ...params, admin: true } });
  return data;
}
export async function adminCreateProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data;
}
export async function adminUpdateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}
export async function adminDeleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}
export async function adminUploadProductImages(files) {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  const { data } = await api.post("/products/upload-images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ---- Categories ----
export async function adminGetCategories() {
  const { data } = await api.get("/categories");
  return data;
}
export async function adminCreateCategory(payload) {
  const { data } = await api.post("/categories", payload);
  return data;
}
export async function adminUpdateCategory(id, payload) {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
}
export async function adminDeleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

// ---- Orders ----
export async function adminGetOrders(params = {}) {
  const { data } = await api.get("/admin/orders", { params });
  return data;
}
export async function adminUpdateOrderStatus(id, payload) {
  const { data } = await api.patch(`/admin/orders/${id}/status`, payload);
  return data;
}

// ---- Returns ----
export async function adminGetReturns(params = {}) {
  const { data } = await api.get("/admin/returns", { params });
  return data;
}
export async function adminReviewReturn(id, payload) {
  const { data } = await api.patch(`/admin/returns/${id}`, payload);
  return data;
}

// ---- Customers ----
export async function adminGetCustomers(params = {}) {
  const { data } = await api.get("/admin/customers", { params });
  return data;
}
export async function adminGetCustomer(id) {
  const { data } = await api.get(`/admin/customers/${id}`);
  return data;
}
export async function adminSetCustomerBlocked(id, blocked) {
  const { data } = await api.patch(`/admin/customers/${id}/block`, { blocked });
  return data;
}

// ---- Coupons ----
export async function adminGetCoupons() {
  const { data } = await api.get("/coupons/admin");
  return data;
}
export async function adminCreateCoupon(payload) {
  const { data } = await api.post("/coupons/admin", payload);
  return data;
}
export async function adminUpdateCoupon(id, payload) {
  const { data } = await api.patch(`/coupons/admin/${id}`, payload);
  return data;
}
export async function adminDeleteCoupon(id) {
  const { data } = await api.delete(`/coupons/admin/${id}`);
  return data;
}

// ---- Reviews moderation ----
export async function adminGetReviews(params = {}) {
  const { data } = await api.get("/admin/reviews", { params });
  return data;
}
export async function adminModerateReview(id, status) {
  const { data } = await api.patch(`/admin/reviews/${id}/status`, { status });
  return data;
}

// ---- Inventory ----
export async function adminGetInventory(params = {}) {
  const { data } = await api.get("/admin/inventory", { params });
  return data;
}
export async function adminAdjustStock(productId, payload) {
  const { data } = await api.patch(`/admin/inventory/${productId}/stock`, payload);
  return data;
}

// ---- Delivery zones ----
export async function adminGetDeliveryZones() {
  const { data } = await api.get("/location/admin/zones");
  return data;
}
export async function adminCreateDeliveryZone(payload) {
  const { data } = await api.post("/location/admin/zones", payload);
  return data;
}
