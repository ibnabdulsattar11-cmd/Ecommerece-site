const isProd = process.env.NODE_ENV === "production";

// httpOnly + secure (in prod) + SameSite prevents the refresh token from
// being read by JS or sent cross-site (CSRF-adjacent protection).
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  path: "/api/auth", // only sent to auth endpoints (refresh/logout)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = { refreshCookieOptions };
