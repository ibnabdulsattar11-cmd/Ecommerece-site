import { body } from "express-validator";

export const addItemRules = [
  body("productId").isUUID().withMessage("Valid productId is required"),
  body("variantId").optional({ nullable: true }).isUUID(),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

export const updateQuantityRules = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const wishlistAddRules = [
  body("productId").isUUID().withMessage("Valid productId is required"),
];

export const moveToCartRules = [
  body("variantId").optional({ nullable: true }).isUUID(),
  body("quantity").optional().isInt({ min: 1 }),
];
