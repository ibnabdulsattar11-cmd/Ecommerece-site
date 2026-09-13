const jwt = require('jsonwebtoken');

/**
 * Unlike the strict auth.middleware.js from Phase 2 (which rejects
 * unauthenticated requests), this one is for routes that work for BOTH
 * guests and logged-in users — e.g. viewing/adding to cart. If a valid
 * access token is present it sets req.user; otherwise it just continues
 * so guestCart.middleware.js can take over.
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role, ... } — same shape as auth.middleware.js
  } catch (err) {
    // invalid/expired token on an optional route -> just treat as guest
  }

  next();
};
