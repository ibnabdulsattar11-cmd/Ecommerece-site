const express = require("express");
const router = express.Router();

const {
  reverseGeocode,
  searchAddress,
  checkDelivery,
  listCities,
  listZones,
  createZone,
  updateZone,
  deleteZone,
} = require("../controllers/location.controller");

const {
  reverseGeocodeRules,
  searchRules,
  deliveryCheckRules,
  zoneRules,
} = require("../validators/location.validator");

const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/admin.middleware");
const { geoLimiter } = require("../middlewares/geoRateLimit.middleware");

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

module.exports = router;
