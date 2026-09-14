const { Op } = require("sequelize");
const { DeliveryZone } = require("../models");

const norm = (s) => (s || "").trim().toLowerCase();

/**
 * Resolution order:
 * 1. Exact match on city + area — lets you override a specific
 *    neighbourhood (e.g. exclude a remote suburb, or charge it more).
 * 2. City-wide zone — a row with area = null means "whole city covered".
 * 3. No match at all -> we simply don't deliver there.
 */
const findZone = async (city, area) => {
  const normalizedCity = norm(city);
  if (!normalizedCity) return null;

  const zones = await DeliveryZone.findAll({
    where: { city: { [Op.iLike]: normalizedCity } },
  });

  if (zones.length === 0) return null;

  const normalizedArea = norm(area);
  if (normalizedArea) {
    const areaMatch = zones.find((z) => norm(z.area) === normalizedArea);
    if (areaMatch) return areaMatch;
  }

  return zones.find((z) => !z.area) || null;
};

const checkDelivery = async ({ city, area }) => {
  if (!city) {
    return { available: false, reason: "City is required to check delivery availability" };
  }

  const zone = await findZone(city, area);

  if (!zone) {
    return { available: false, reason: "We do not currently deliver to this location" };
  }

  if (!zone.isAvailable) {
    return {
      available: false,
      reason: "Delivery to this area is temporarily paused",
      matchedZone: { city: zone.city, area: zone.area },
    };
  }

  return {
    available: true,
    shippingCharge: parseFloat(zone.shippingCharge),
    estimatedDeliveryDays: zone.estimatedDeliveryDays,
    matchedZone: { city: zone.city, area: zone.area },
  };
};

// Powers a plain dropdown fallback for the address form (in case the user
// prefers not to use the map/geolocation).
const listAvailableCities = async () => {
  const zones = await DeliveryZone.findAll({
    where: { isAvailable: true },
    order: [["city", "ASC"], ["area", "ASC"]],
  });

  const byCity = {};
  zones.forEach((z) => {
    if (!byCity[z.city]) byCity[z.city] = { city: z.city, areas: [] };
    if (z.area) byCity[z.city].areas.push(z.area);
  });

  return Object.values(byCity);
};

module.exports = { findZone, checkDelivery, listAvailableCities };
