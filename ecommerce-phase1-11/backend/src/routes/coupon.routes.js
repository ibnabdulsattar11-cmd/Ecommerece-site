import express from "express";

import couponController from "../controllers/coupon.controller.js";

import {
    validateCouponRules,
    couponRules,
} from "../validators/checkout.validator.js";

import validate from "../middlewares/validate.middleware.js";

import {
    protect,
    optionalAuth,
} from "../middlewares/auth.middleware.js";

import { restrictTo } from "../middlewares/admin.middleware.js";

import guestCart from "../middlewares/guestCart.middleware.js"; // from Phase 4

const router = express.Router();
// Works for guests too (coupon preview against a guest cart), personalized
// (per-user limits/eligibility) when logged in.
router.post("/validate", optionalAuth, guestCart, validateCouponRules, validate, couponController.validate);

/* ---------------------------- Admin ---------------------------- */
router.get("/admin", protect, restrictTo("ADMIN"), couponController.listCoupons);
router.post("/admin", protect, restrictTo("ADMIN"), couponRules, validate, couponController.createCoupon);
router.patch("/admin/:id", protect, restrictTo("ADMIN"), couponRules, validate, couponController.updateCoupon);
router.delete("/admin/:id", protect, restrictTo("ADMIN"), couponController.deleteCoupon);

export default router;
