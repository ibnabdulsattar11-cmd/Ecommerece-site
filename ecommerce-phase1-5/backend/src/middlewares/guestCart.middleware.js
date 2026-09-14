const crypto = require("crypto");

const GUEST_COOKIE_NAME = "guest_cart_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Runs on every /api/cart/* request. Doesn't require login — if the
 * request has no valid JWT (req.user is unset by an earlier optional-auth
 * middleware) it falls back to a guestToken cookie, creating one if needed.
 * Cart controller then looks up the cart by req.user.id OR req.guestToken.
 */
module.exports = (req, res, next) => {
  if (req.user) {
    // logged-in requests don't need a guest token
    return next();
  }

  let token = req.cookies?.[GUEST_COOKIE_NAME];

  if (!token) {
    token = crypto.randomBytes(24).toString("hex");
    res.cookie(GUEST_COOKIE_NAME, token, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  req.guestToken = token;
  next();
};

module.exports.GUEST_COOKIE_NAME = GUEST_COOKIE_NAME;
