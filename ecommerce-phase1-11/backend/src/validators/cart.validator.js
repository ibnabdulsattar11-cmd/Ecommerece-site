const { body } = require('express-validator');

exports.addItemRules = [
  body('productId').isUUID().withMessage('Valid productId is required'),
  body('variantId').optional({ nullable: true }).isUUID(),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

exports.updateQuantityRules = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

exports.wishlistAddRules = [
  body('productId').isUUID().withMessage('Valid productId is required'),
];

exports.moveToCartRules = [
  body('variantId').optional({ nullable: true }).isUUID(),
  body('quantity').optional().isInt({ min: 1 }),
];
