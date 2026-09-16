const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const {
  createProductRules,
  updateProductRules,
  listProductsRules,
} = require("../validators/product.validator");
const validate = require("../middlewares/validate.middleware");
// FIX (Phase 9): these were being imported as bare default functions, but
// both middleware files export named objects ({ protect, optionalAuth }
// and { restrictTo }) — using an object where Express expects a function
// crashes as soon as any of the routes below are hit.
const { protect: authMiddleware } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/admin.middleware");
const adminMiddleware = restrictTo("ADMIN");
const {
  upload,
  handleProductImageUpload,
} = require("../services/upload.service");

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

module.exports = router;
