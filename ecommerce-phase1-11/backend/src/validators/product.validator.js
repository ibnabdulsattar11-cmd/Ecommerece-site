import { body, query } from "express-validator";

export const createProductRules = [
  body("nameEn").trim().notEmpty().withMessage("English name is required"),
  body("nameAr").trim().notEmpty().withMessage("Arabic name is required"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("salePrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number")
    .custom((value, { req }) => {
      if (value && parseFloat(value) >= parseFloat(req.body.price)) {
        throw new Error("Sale price must be less than the regular price");
      }
      return true;
    }),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be 0 or more"),
  body("categoryId").isUUID().withMessage("Valid categoryId is required"),
  body("status").optional().isIn(["draft", "active", "INACTIVE"]),
  body("variants").optional().isArray(),
  body("variants.*.size").optional().isString(),
  body("variants.*.color").optional().isString(),
  body("variants.*.stock").optional().isInt({ min: 0 }),
  body("variants.*.priceModifier").optional().isFloat(),
];

export const updateProductRules = [
  body("price").optional().isFloat({ min: 0 }),
  body("salePrice").optional({ nullable: true }).isFloat({ min: 0 }),
  body("stock").optional().isInt({ min: 0 }),
  body("categoryId").optional().isUUID(),
  body("status").optional().isIn(["draft", "active", "INACTIVE"]),
];

export const listProductsRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "newest", "rating", "popular"]),
];
