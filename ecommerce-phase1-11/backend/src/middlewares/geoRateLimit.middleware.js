import rateLimit from ("express-rate-limit");

// The general `apiLimiter` in app.js is too generous for geocoding — those
// calls proxy to Nominatim's free public API, which has a strict usage
// policy. This limiter keeps a single user's search box / map dragging from
// hammering that upstream, independent of the rest of the app.
const geoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many location requests, please slow down.",
  },
});

export default { geoLimiter };
