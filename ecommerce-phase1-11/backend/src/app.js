require("express-async-errors");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const xssClean = require("xss-clean");
const morgan = require("morgan"); // Phase 11 — HTTP request logging
const compression = require("compression"); // Phase 11 — gzip responses

const errorHandler = require("./middlewares/errorHandler.middleware");
const requestId = require("./middlewares/requestId.middleware"); // Phase 11
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const passport = require("./config/passport");

// Route imports (added incrementally as modules are built)
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const locationRoutes = require("./routes/location.routes");
const couponRoutes = require("./routes/coupon.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const orderRoutes = require("./routes/order.routes");
const webhookRoutes = require("./routes/webhook.routes");
const reviewRoutes = require("./routes/review.routes"); // FIX (Phase 11): existed, was never mounted
const notificationRoutes = require("./routes/notification.routes"); // FIX (Phase 11): existed, was never mounted

const app = express();

// FIX (Phase 11): required when running behind any reverse proxy (nginx,
// Render, Railway, a load balancer, etc.) — without this, express-rate-limit
// sees the proxy's IP for every request (so all users share one rate-limit
// bucket) and `secure` cookies/req.protocol checks can misbehave. Harmless
// locally. Set TRUST_PROXY=0 to disable if you're not behind a proxy.
if (process.env.TRUST_PROXY !== "0") {
  app.set("trust proxy", 1);
}

app.use(requestId);

// Concise in dev, Apache "combined" format in production; tagged with the
// request id so a log line can be cross-referenced with an error response.
morgan.token("id", (req) => req.id);
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    skip: (req) => req.path === "/api/health",
  }),
);

app.use(compression());

app.use(
  helmet({
    // Pure JSON API (no HTML views to protect with a page-level CSP) plus
    // static /uploads images — helmet's default CSP is meant for
    // HTML-serving apps and can interfere with little benefit here.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // let the frontend origin load /uploads images
  }),
);
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }),
  );
}

// FIX (Phase 11): CLIENT_URL can now be a comma-separated list (e.g. a
// staging + production frontend, or www + non-www) instead of one origin.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// 1) Webhook FIRST — raw body parser is scoped inside webhook.routes.js itself
app.use("/api/webhooks", webhookRoutes);

app.use(express.json({ limit: "10kb" })); // request size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(hpp()); // HTTP parameter pollution protection
app.use(xssClean()); // basic XSS sanitization
app.use(passport.initialize());

app.use("/api", apiLimiter);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "7d", // Phase 11: static assets rarely change once uploaded — let browsers cache them
  }),
);

app.get("/api/health", async (req, res) => {
  // FIX (Phase 11): a health check that doesn't verify the DB connection
  // tells an orchestrator/load-balancer "I'm fine" right up until the
  // first real request fails — check the thing that actually matters.
  try {
    const { sequelize } = require("./models");
    await sequelize.authenticate();
    res
      .status(200)
      .json({ success: true, message: "API is running", db: "connected" });
  } catch (err) {
    res.status(503).json({ success: false, message: "Database unreachable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", reviewRoutes); // FIX (Phase 11): mounts /:productId/reviews... alongside product routes
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes); // FIX (Phase 11)
app.use("/api/admin/orders", require("./routes/admin/order.routes"));
app.use("/api/admin/returns", require("./routes/admin/return.routes"));
app.use("/api/admin/dashboard", require("./routes/admin/dashboard.routes"));
app.use("/api/admin/customers", require("./routes/admin/customer.routes"));
app.use("/api/admin/inventory", require("./routes/admin/inventory.routes"));
app.use("/api/admin/reviews", require("./routes/admin/review.routes")); // FIX (Phase 11)
app.use("/api/admin/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
