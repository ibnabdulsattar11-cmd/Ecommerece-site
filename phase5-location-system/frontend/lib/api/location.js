import axios from "@/lib/axios";

export async function reverseGeocode(lat, lng, locale = "en") {
  const { data } = await axios.get("/location/reverse-geocode", { params: { lat, lng, locale } });
  return data; // { success, data: { displayName, country, city, area, street, postalCode, latitude, longitude } }
}

export async function searchAddress(q, { limit = 5, countryCodes, locale = "en" } = {}) {
  const { data } = await axios.get("/location/search", { params: { q, limit, countryCodes, locale } });
  return data; // { success, data: [ {displayName, city, area, latitude, longitude, ...} ] }
}

export async function checkDelivery({ city, area, latitude, longitude, locale = "en" }) {
  const { data } = await axios.post("/location/delivery-check", { city, area, latitude, longitude, locale });
  return data; // { success, data: { available, shippingCharge?, estimatedDeliveryDays?, reason? } }
}

export async function listCities() {
  const { data } = await axios.get("/location/cities");
  return data; // { success, data: [ { city, areas: [] } ] }
}
