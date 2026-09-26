import api from "@/lib/axios";

export async function getProfile() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}

export async function getAddresses() {
  const { data } = await api.get("/users/me/addresses");
  return data;
}

export async function createAddress(payload) {
  const { data } = await api.post("/users/me/addresses", payload);
  return data;
}

export async function updateAddress(id, payload) {
  const { data } = await api.patch(`/users/me/addresses/${id}`, payload);
  return data;
}

export async function deleteAddress(id) {
  const { data } = await api.delete(`/users/me/addresses/${id}`);
  return data;
}

export async function setDefaultAddress(id) {
  const { data } = await api.patch(`/users/me/addresses/${id}/default`);
  return data;
}
