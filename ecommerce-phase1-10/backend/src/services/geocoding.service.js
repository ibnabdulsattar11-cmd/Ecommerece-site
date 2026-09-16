const ApiError = require("../utils/ApiError");

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
// Nominatim's usage policy REQUIRES a descriptive User-Agent that identifies
// your app (and ideally a contact). Set NOMINATIM_USER_AGENT in .env before
// going to production — using the default below against the free public
// instance may get you rate-limited or blocked.
const USER_AGENT = process.env.NOMINATIM_USER_AGENT || "bilingual-ecommerce-app/1.0 (set NOMINATIM_USER_AGENT in .env)";

// Free public Nominatim caps usage at ~1 request/second. We enforce a simple
// in-process queue so a burst of user activity (typing in the search box,
// dragging the map pin) never breaks that limit. If traffic grows beyond a
// small app, swap this service for a paid provider (LocationIQ, Mapbox,
// Google Geocoding) — reverseGeocode()/searchAddress() signatures can stay
// the same, only the fetch call inside nominatimFetch() changes.
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

const throttle = async () => {
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
};

const nominatimFetch = async (path, params) => {
  await throttle();

  const url = new URL(`${NOMINATIM_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  let response;
  try {
    // Requires Node 18+ (global fetch). Project already assumes a modern
    // Node LTS for the rest of the stack, so no extra dependency is added.
    response = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": params.locale === "ar" ? "ar" : "en",
      },
    });
  } catch (err) {
    throw new ApiError(502, "Could not reach the location service");
  }

  if (!response.ok) {
    throw new ApiError(502, "Location service is currently unavailable");
  }

  return response.json();
};

// Normalizes Nominatim's inconsistent `address` object into a flat shape
// that matches our Address model's fields as closely as possible.
const normalizeAddress = (raw) => {
  const a = raw.address || {};
  return {
    displayName: raw.display_name,
    country: a.country || "",
    city: a.city || a.town || a.village || a.municipality || a.county || "",
    area: a.suburb || a.neighbourhood || a.city_district || a.quarter || "",
    street: [a.road, a.house_number].filter(Boolean).join(" ") || a.road || "",
    postalCode: a.postcode || "",
    latitude: parseFloat(raw.lat),
    longitude: parseFloat(raw.lon),
  };
};

// lat/lng -> structured address (used after "use my location" or map drag)
const reverseGeocode = async (latitude, longitude, locale = "en") => {
  const data = await nominatimFetch("/reverse", {
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
    addressdetails: 1,
    locale,
  });

  if (!data || data.error) {
    throw new ApiError(404, "Could not resolve an address for this location");
  }

  return normalizeAddress(data);
};

// free-text query -> list of candidate addresses (used by the search box)
const searchAddress = async (query, { limit = 5, countryCodes, locale = "en" } = {}) => {
  const data = await nominatimFetch("/search", {
    format: "jsonv2",
    q: query,
    addressdetails: 1,
    limit,
    countrycodes: countryCodes,
    locale,
  });

  if (!Array.isArray(data)) return [];
  return data.map(normalizeAddress);
};

module.exports = { reverseGeocode, searchAddress };
