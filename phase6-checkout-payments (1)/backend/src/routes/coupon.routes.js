const express = require('express');
const router = express.Router();

const couponController = require('../controllers/coupon.controller');
const { couponValidateRules, createCouponRules } = require('../validators/checkout.validator');
const validate = require('../middlewares/validate.middleware');
const optionalAuth = require('../middlewares/optionalAuth.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// public-ish: works for logged-in users, returns 401 with a clear message for guests
router.post('/validate', optionalAuth, couponValidateRules, validate, couponController.validate);

// admin
router.get('/', authMiddleware, adminMiddleware, couponController.getCoupons);
router.post('/', authMiddleware, adminMiddleware, createCouponRules, validate, couponController.createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;
