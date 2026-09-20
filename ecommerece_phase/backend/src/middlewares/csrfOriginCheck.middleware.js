import ApiError from "../utils/ApiError.js";

/**
 * `POST /api/auth/refresh` and `/api/auth/logout` authenticate purely via
 * the httpOnly refreshToken cookie (no Authorization header required),
 * which makes them the only real CSRF surface in this API — every other
 * mutating route requires a Bearer token that a cross-site page can't
 * attach to a forged request.
 *
 * `refreshCookieOptions` already sets `sameSite: "strict"` in production,
 * which on its own stops modern browsers from sending the cookie on a
 * cross-site request at all — this middleware is a second layer for
 * older/misbehaving browsers and for local dev (where sameSite is "lax"),
 * not the primary defense.
 */
const csrfOriginCheck = (req, res, next) => {
  const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return next(); // non-browser clients (mobile apps, curl, Postman) send neither — allow through

  const matches = allowedOrigins.some((allowed) => origin.startsWith(allowed));
  if (!matches) {
    return next(new ApiError(403, "Request blocked: origin not allowed"));
  }

  next();
};

export default csrfOriginCheck;
