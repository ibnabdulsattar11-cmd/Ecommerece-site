const express = require('express');
const router = express.Router();

const webhookController = require('../controllers/webhook.controller');

// express.raw() here is critical — Stripe's signature verification
// (stripeService.constructWebhookEvent) needs the EXACT raw request
// bytes. If express.json() has already parsed/re-serialized the body,
// the signature check will always fail. See README for app.js wiring.
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
