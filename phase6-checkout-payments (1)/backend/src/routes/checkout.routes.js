const express = require('express');
const router = express.Router();

const checkoutController = require('../controllers/checkout.controller');
const { checkoutRules } = require('../validators/checkout.validator');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// Checkout always requires a logged-in user (guest checkout is a product
// decision you can add later by allowing addressId to come from a
// one-off shipping form instead of a saved Address row).
router.use(authMiddleware);

router.get('/summary', checkoutController.getSummary);
router.post('/create-payment-intent', checkoutRules, validate, checkoutController.createPaymentIntent);
router.post('/place-order', checkoutRules, validate, checkoutController.placeOrderCOD);

module.exports = router;
