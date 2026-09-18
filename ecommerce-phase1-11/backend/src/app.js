import "express-async-errors";
import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import xssClean from "xss-clean";
import morgan from "morgan";
import compression from "compression";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import requestId from "./middlewares/requestId.middleware.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import locationRoutes from "./routes/location.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

if (process.env.TRUST_PROXY !== "0") {
  app.set("trust proxy", 1);
}

app.use(requestId);

morgan.token("id", (req) => req.id);
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    skip: (req) => req.path === "/api/health",
  }),
);

app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // let the frontend origin load /uploads images
  }),
);
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }),
  );
}

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
    maxAge: "7d",
  }),
);

app.get("/api/health", async (req, res) => {
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
app.use("/api/products", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/orders", require("./routes/admin/order.routes"));
app.use("/api/admin/returns", require("./routes/admin/return.routes"));
app.use("/api/admin/dashboard", require("./routes/admin/dashboard.routes"));
app.use("/api/admin/customers", require("./routes/admin/customer.routes"));
app.use("/api/admin/inventory", require("./routes/admin/inventory.routes"));
app.use("/api/admin/reviews", require("./routes/admin/review.routes"));
app.use("/api/admin/analytics", analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
