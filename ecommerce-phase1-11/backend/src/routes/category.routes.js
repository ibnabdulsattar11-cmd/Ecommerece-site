import express from "express";

import categoryController from "../controllers/category.controller.js";

import {
    createCategoryRules,
    updateCategoryRules,
} from "../validators/category.validator.js";

import validate from "../middlewares/validate.middleware.js";

// FIX (Phase 9): see product.routes.js — same bare-import bug, same fix.
import { protect as authMiddleware } from "../middlewares/auth.middleware.js";

import  restrictTo  from "../middlewares/admin.middleware.js";

const router = express.Router();
const adminMiddleware = restrictTo("ADMIN");

// Public
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// Admin only
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCategoryRules,
  validate,
  categoryController.createCategory,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCategoryRules,
  validate,
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory,
);

export default router;
