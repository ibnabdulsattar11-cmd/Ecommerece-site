const { body } = require('express-validator');

exports.createCategoryRules = [
  body('nameEn').trim().notEmpty().withMessage('English name is required'),
  body('nameAr').trim().notEmpty().withMessage('Arabic name is required'),
  body('parentId').optional({ nullable: true }).isUUID().withMessage('parentId must be a valid UUID'),
  body('sortOrder').optional().isInt(),
];

exports.updateCategoryRules = [
  body('parentId').optional({ nullable: true }).isUUID(),
  body('sortOrder').optional().isInt(),
  body('isActive').optional().isBoolean(),
];
