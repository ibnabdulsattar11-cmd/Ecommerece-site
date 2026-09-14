const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category.controller");
const {
  createCategoryRules,
  updateCategoryRules,
} = require("../validators/category.validator");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

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
