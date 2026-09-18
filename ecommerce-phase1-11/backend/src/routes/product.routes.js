import express from "express";

import productController from "../controllers/product.controller.js";

import {
    createProductRules,
    updateProductRules,
    listProductsRules,
} from "../validators/product.validator.js";

import validate from "../middlewares/validate.middleware.js";

// FIX (Phase 9): these were being imported as bare default functions, but
// both middleware files export named objects ({ protect, optionalAuth }
// and { restrictTo }) — using an object where Express expects a function
// crashes as soon as any of the routes below are hit.
import { protect as authMiddleware } from "../middlewares/auth.middleware.js";

import restrictTo  from "../middlewares/admin.middleware.js";

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

// Image upload (call this first, then pass returned URLs into create/update body)
router.post(
  "/upload-images",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 8),
  handleProductImageUpload,
);

export default router;
