import { DeliveryZone } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import geocodingService from "../services/geocoding.service.js";

import deliveryZoneService from "../services/deliveryZone.service.js";
/* ---------------------------- PUBLIC ---------------------------- */

// GET /api/location/reverse-geocode?lat=&lng=&locale=
const reverseGeocode = async (req, res) => {
  const { lat, lng, locale } = req.query;
  const address = await geocodingService.reverseGeocode(lat, lng, locale);
  res.status(200).json(new ApiResponse(200, address));
};

// GET /api/location/search?q=&limit=&countryCodes=&locale=
const searchAddress = async (req, res) => {
  const { q, limit, countryCodes, locale } = req.query;
  const results = await geocodingService.searchAddress(q, {
    limit: limit ? Number(limit) : undefined,
    countryCodes,
    locale,
  });
  res.status(200).json(new ApiResponse(200, results));
};

// POST /api/location/delivery-check  { city, area?, latitude?, longitude?, locale? }
const checkDelivery = async (req, res) => {
  let { city, area, latitude, longitude, locale } = req.body;

  // Lets the frontend send raw coordinates (e.g. straight from "use my
  // location") and have the backend resolve city/area itself.
  if (!city && latitude && longitude) {
    const resolved = await geocodingService.reverseGeocode(
      latitude,
      longitude,
      locale,
    );
    city = resolved.city;
    area = resolved.area;
  }

  const result = await deliveryZoneService.checkDelivery({ city, area });
  res.status(200).json(new ApiResponse(200, result));
};

// GET /api/location/cities
const listCities = async (req, res) => {
  const cities = await deliveryZoneService.listAvailableCities();
  res.status(200).json(new ApiResponse(200, cities));
};

/* ---------------------------- ADMIN (delivery zone management) ---------------------------- */
// Basic CRUD so zones can actually be populated/tested before Phase 9's
// admin panel gives it a proper UI.

const listZones = async (req, res) => {
  const zones = await DeliveryZone.findAll({
    order: [
      ["city", "ASC"],
      ["area", "ASC"],
    ],
  });
  res.status(200).json(new ApiResponse(200, zones));
};

const createZone = async (req, res) => {
  const zone = await DeliveryZone.create(req.body);
  res.status(201).json(new ApiResponse(201, zone, "Delivery zone created"));
};

const updateZone = async (req, res) => {
  const zone = await DeliveryZone.findByPk(req.params.id);
  if (!zone) throw new ApiError(404, "Delivery zone not found");
  await zone.update(req.body);
  res.status(200).json(new ApiResponse(200, zone, "Delivery zone updated"));
};

const deleteZone = async (req, res) => {
  const zone = await DeliveryZone.findByPk(req.params.id);
  if (!zone) throw new ApiError(404, "Delivery zone not found");
  await zone.destroy();
  res.status(200).json(new ApiResponse(200, null, "Delivery zone deleted"));
};

export default {
  reverseGeocode,
  searchAddress,
  checkDelivery,
  listCities,
  listZones,
  createZone,
  updateZone,
  deleteZone,
};
