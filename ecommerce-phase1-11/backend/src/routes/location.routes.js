import express from "express";

import {
  reverseGeocode,
  searchAddress,
  checkDelivery,
  listCities,
  listZones,
  createZone,
  updateZone,
  deleteZone,
} from "../controllers/location.controller.js";

import {
  reverseGeocodeRules,
  searchRules,
  deliveryCheckRules,
  zoneRules,
} from "../validators/location.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { protect } from "../middlewares/auth.middleware.js";

import restrictTo from "../middlewares/admin.middleware.js";

import { geoLimiter } from "../middlewares/geoRateLimit.middleware.js";

const router = express.Router();
/* ---------------------------- Public ---------------------------- */
router.get(
  "/reverse-geocode",
  geoLimiter,
  reverseGeocodeRules,
  validate,
  reverseGeocode,
);
router.get("/search", geoLimiter, searchRules, validate, searchAddress);
router.post("/delivery-check", deliveryCheckRules, validate, checkDelivery);
router.get("/cities", listCities);

/* ---------------------------- Admin (delivery zones) ---------------------------- */
router.get("/admin/zones", protect, restrictTo("ADMIN"), listZones);
router.post(
  "/admin/zones",
  protect,
  restrictTo("ADMIN"),
  zoneRules,
  validate,
  createZone,
);
router.patch(
  "/admin/zones/:id",
  protect,
  restrictTo("ADMIN"),
  zoneRules,
  validate,
  updateZone,
);
router.delete("/admin/zones/:id", protect, restrictTo("ADMIN"), deleteZone);

export default router;
