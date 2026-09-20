import express from "express";
const router = express.Router();

import { handleStripeWebhook } from "../controllers/webhook.controller.js";

router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
