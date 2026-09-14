const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");
const {
  addItemRules,
  updateQuantityRules,
} = require("../validators/cart.validator");
const validate = require("../middlewares/validate.middleware");
const optionalAuth = require("../middlewares/optionalAuth.middleware");
const guestCart = require("../middlewares/guestCart.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

// Every cart route: try to decode a JWT if present, else fall back to
// the guest cookie -> so the same endpoints work logged-in or not.
router.use(optionalAuth, guestCart);

router.get("/", cartController.getCart);
router.post("/items", addItemRules, validate, cartController.addItem);
router.put(
  "/items/:itemId",
  updateQuantityRules,
  validate,
  cartController.updateItemQuantity,
);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);

// Merge requires an actual logged-in user (strict auth), called right after login
router.post("/merge", authMiddleware, cartController.mergeCart);

module.exports = router;
