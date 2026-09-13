require("express-async-errors");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const xssClean = require("xss-clean");

const errorHandler = require("./middlewares/errorHandler.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const passport = require("./config/passport");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Route imports (added incrementally as modules are built)
// const categoryRoutes = require("./routes/category.routes");
// const productRoutes = require("./routes/product.routes");
// const cartRoutes = require("./routes/cart.routes");
// const wishlistRoutes = require("./routes/wishlist.routes");
// const locationRoutes = require("./routes/location.routes");
// const couponRoutes = require("./routes/coupon.routes");
// const checkoutRoutes = require("./routes/checkout.routes");
// const orderRoutes = require("./routes/order.routes");
// const webhookRoutes = require("./routes/webhook.routes");
// const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// NOTE: Stripe webhook route needs the RAW body, so it must be registered
// with express.raw() BEFORE express.json() is applied globally.
// app.use("/api/webhooks", webhookRoutes);

app.use(express.json({ limit: "10kb" })); // request size limit
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(hpp()); // HTTP parameter pollution protection
app.use(xssClean()); // basic XSS sanitization
app.use(passport.initialize());

app.use("/api", apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/wishlist", wishlistRoutes);
// app.use("/api/location", locationRoutes);
// app.use("/api/coupons", couponRoutes);
// app.use("/api/checkout", checkoutRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
