import { body } from "express-validator";

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("language").optional().isIn(["en", "ar"]),
];

const addressValidator = [
  body("label").optional().isIn(["Home", "Office", "Other"]),
  body("country").notEmpty().withMessage("Country is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("area").notEmpty().withMessage("Area is required"),
  body("street").notEmpty().withMessage("Street is required"),
  body("houseNo").optional(),
  body("postalCode").optional(),
  body("latitude").optional().isFloat({ min: -90, max: 90 }),
  body("longitude").optional().isFloat({ min: -180, max: 180 }),
  body("isDefault").optional().isBoolean(),
];

export { updateProfileValidator, addressValidator };