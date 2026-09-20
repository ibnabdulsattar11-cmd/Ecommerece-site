import express from "express";
const router = express.Router();

import {
  addToWishlist,
  getWishlist,
  moveToCart,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import {
  wishlistAddRules,
  moveToCartRules,
} from "../validators/cart.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { protect as authMiddleware } from "../middlewares/auth.middleware.js";

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/", wishlistAddRules, validate, addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.post("/:productId/move-to-cart", moveToCartRules, validate, moveToCart);

export default router;
