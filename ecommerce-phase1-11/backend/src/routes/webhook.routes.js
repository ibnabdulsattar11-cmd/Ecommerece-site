import express from "express";
const router = express.Router();

import { handleStripeWebhook } from "../controllers/webhook.controller";

// express.raw() here is critical — Stripe's signature verification needs
// the EXACT raw request bytes. If express.json() has already parsed the
// body, the signature check always fails. This route must be mounted in
// app.js BEFORE the global express.json() middleware — see README.
router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
