import express from "express";

import cartController from "../controllers/cart.controller.js";

import {
  addItemRules,
  updateQuantityRules,
} from "../validators/cart.validator.js";

import validate from "../middlewares/validate.middleware.js";

import optionalAuth from "../middlewares/optionalAuth.middleware.js";

import guestCart from "../middlewares/guestCart.middleware.js";

// FIX (Phase 9): same bare-import bug as product/category routes — this
// broke POST /api/cart/merge (called right after login) specifically.
import { protect as authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
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

export default router;
