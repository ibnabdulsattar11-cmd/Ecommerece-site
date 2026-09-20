import { body } from "express-validator";

const addItemRules = [
  body("productId").isUUID().withMessage("Valid productId is required"),
  body("variantId").optional({ nullable: true }).isUUID(),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateQuantityRules = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const wishlistAddRules = [
  body("productId").isUUID().withMessage("Valid productId is required"),
];

const moveToCartRules = [
  body("variantId").optional({ nullable: true }).isUUID(),
  body("quantity").optional().isInt({ min: 1 }),
];


export { addItemRules, updateQuantityRules, wishlistAddRules, moveToCartRules };