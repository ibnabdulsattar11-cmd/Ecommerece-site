import express from "express";

import {
    createPaymentIntent,
    placeOrder,
} from "../controllers/checkout.controller.js";

import { checkoutRules } from "../validators/checkout.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { optionalAuth } from "../middlewares/auth.middleware.js"; // from Phase 1-2 — fetches full req.user

import guestCart from "../middlewares/guestCart.middleware.js"; // from Phase 4 — guest cart cookie

const router = express.Router();
// Same pattern as Phase 4's cart routes: works for logged-in users AND
// guests (guest cart cookie), since guest checkout is supported (see
// checkout.service.js's resolveShippingAddress).
router.use(optionalAuth, guestCart);

router.post("/create-payment-intent", checkoutRules, validate, createPaymentIntent);
router.post("/place-order", checkoutRules, validate, placeOrder);

export default router;
