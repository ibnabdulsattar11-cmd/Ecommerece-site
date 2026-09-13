const { validationResult } = require('express-validator');

/**
 * Runs after any express-validator rule chain (e.g. createProductRules).
 * If validation failed, returns a clean 400 with all field errors instead
 * of letting the request continue into the controller.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
