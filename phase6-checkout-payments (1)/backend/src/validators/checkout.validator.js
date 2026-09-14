const { body } = require('express-validator');

exports.checkoutRules = [
  body('addressId').isUUID().withMessage('Valid addressId is required'),
  body('couponCode').optional({ nullable: true }).trim(),
];

exports.couponValidateRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('subtotal is required'),
];

exports.createCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('type').isIn(['PERCENT', 'FIXED']).withMessage('type must be PERCENT or FIXED'),
  body('value').isFloat({ min: 0 }).withMessage('value must be 0 or more'),
  body('minOrder').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('expiryDate').optional({ nullable: true }).isISO8601(),
  body('usageLimit').optional({ nullable: true }).isInt({ min: 1 }),
  body('perUserLimit').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean(),
];
