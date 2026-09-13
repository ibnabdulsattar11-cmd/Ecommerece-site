const ApiError = require("../utils/ApiError");

// Usage: router.get('/admin-only', protect, restrictTo('ADMIN'), handler)
// IMPORTANT: this must always run AFTER `protect` on the backend.
// Hiding an admin button on the frontend is not authorization.
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { restrictTo };
