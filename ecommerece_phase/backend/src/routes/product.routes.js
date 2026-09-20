import express from "express";
const router = express.Router();

import productController from "../controllers/product.controller.js";

import {
  createProductRules,
  updateProductRules,
  listProductsRules,
} from "../validators/product.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { protect as authMiddleware } from "../middlewares/auth.middleware.js";

import { restrictTo } from "../middlewares/admin.middleware.js";

const adminMiddleware = restrictTo("ADMIN");

import {
  upload,
  handleProductImageUpload,
} from "../services/upload.service.js";

// ---- Public ----
router.get("/", listProductsRules, validate, productController.getProducts);
router.get("/filters/meta", productController.getFilterMeta);
router.get("/recently-viewed", productController.getRecentlyViewed);
router.get("/:slug", productController.getProductBySlug);

// ---- Admin ----
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  productController.getProductByIdAdmin,
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProductRules,
  validate,
  productController.createProduct,
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProductRules,
  validate,
  productController.updateProduct,
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);

router.post(
  "/upload-images",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 8),
  handleProductImageUpload,
);

export default router;
