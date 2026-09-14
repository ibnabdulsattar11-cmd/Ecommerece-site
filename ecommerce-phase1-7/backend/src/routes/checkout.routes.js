const express = require("express");
const router = express.Router();

const { createPaymentIntent, placeOrder } = require("../controllers/checkout.controller");
const { checkoutRules } = require("../validators/checkout.validator");
const validate = require("../middlewares/validate.middleware");
const { optionalAuth } = require("../middlewares/auth.middleware"); // from Phase 1-2 — fetches full req.user
const guestCart = require("../middlewares/guestCart.middleware"); // from Phase 4 — guest cart cookie

// Same pattern as Phase 4's cart routes: works for logged-in users AND
// guests (guest cart cookie), since guest checkout is supported (see
// checkout.service.js's resolveShippingAddress).
router.use(optionalAuth, guestCart);

router.post("/create-payment-intent", checkoutRules, validate, createPaymentIntent);
router.post("/place-order", checkoutRules, validate, placeOrder);

module.exports = router;
