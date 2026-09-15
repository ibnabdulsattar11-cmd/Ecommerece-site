const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const {
  createCategoryRules,
  updateCategoryRules,
} = require("../validators/category.validator");
const validate = require("../middlewares/validate.middleware");
// FIX (Phase 9): see product.routes.js — same bare-import bug, same fix.
const { protect: authMiddleware } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/admin.middleware");
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

module.exports = router;
