const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Run after a chain of express-validator checks; collects and formats errors.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`);
    throw new ApiError(400, "Validation failed", messages);
  }
  next();
};

module.exports = validate;
