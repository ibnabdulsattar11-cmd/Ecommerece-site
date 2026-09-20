import { query, body } from "express-validator";

const reverseGeocodeRules = [
  query("lat").notEmpty().withMessage("lat is required").isFloat({ min: -90, max: 90 }),
  query("lng").notEmpty().withMessage("lng is required").isFloat({ min: -180, max: 180 }),
  query("locale").optional().isIn(["en", "ar"]),
];

const searchRules = [
  query("q").trim().isLength({ min: 3 }).withMessage("Search query must be at least 3 characters"),
  query("limit").optional().isInt({ min: 1, max: 10 }),
  query("locale").optional().isIn(["en", "ar"]),
];

const deliveryCheckRules = [
  body("city").optional().trim(),
  body("area").optional().trim(),
  body("latitude").optional().isFloat({ min: -90, max: 90 }),
  body("longitude").optional().isFloat({ min: -180, max: 180 }),
  body().custom((value) => {
    if (!value.city && (!value.latitude || !value.longitude)) {
      throw new Error("Provide either a city or a latitude/longitude pair");
    }
    return true;
  }),
];

const zoneRules = [
  body("country").notEmpty().withMessage("Country is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("area").optional({ nullable: true }).trim(),
  body("shippingCharge").isFloat({ min: 0 }).withMessage("shippingCharge must be a positive number"),
  body("isAvailable").optional().isBoolean(),
  body("estimatedDeliveryDays").optional().isInt({ min: 0 }),
];

export { reverseGeocodeRules, searchRules, deliveryCheckRules, zoneRules };