const express = require("express");
const router = express.Router();

const couponController = require("../controllers/coupon.controller");
const { validateCouponRules, couponRules } = require("../validators/checkout.validator");
const validate = require("../middlewares/validate.middleware");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");
const { restrictTo } = require("../middlewares/admin.middleware");
const guestCart = require("../middlewares/guestCart.middleware"); // from Phase 4

// Works for guests too (coupon preview against a guest cart), personalized
// (per-user limits/eligibility) when logged in.
router.post("/validate", optionalAuth, guestCart, validateCouponRules, validate, couponController.validate);

/* ---------------------------- Admin ---------------------------- */
router.get("/admin", protect, restrictTo("ADMIN"), couponController.listCoupons);
router.post("/admin", protect, restrictTo("ADMIN"), couponRules, validate, couponController.createCoupon);
router.patch("/admin/:id", protect, restrictTo("ADMIN"), couponRules, validate, couponController.updateCoupon);
router.delete("/admin/:id", protect, restrictTo("ADMIN"), couponController.deleteCoupon);

module.exports = router;
