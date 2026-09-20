"use strict";

import { Router } from "express";
const router = Router();
import { getBestSellingProducts, getCustomerBreakdown, getOrderStatusBreakdown, getOverview, getRevenueOverTime, getSalesByCategory, getTopCustomers } from "../controllers/analytics.controller.js";
import { dateRangeRules, revenueOverTimeRules, limitRules } from "../validators/analytics.validator.js";

import { protect } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/admin.middleware.js";
import validate from "../middlewares/validate.middleware.js";

// Every analytics route is admin-only.
router.use(protect, restrictTo("ADMIN"));

// GET /api/admin/analytics/overview?from=&to=
router.get("/overview", dateRangeRules, validate, getOverview);

// GET /api/admin/analytics/revenue?from=&to=&groupBy=day|week|month
router.get("/revenue", revenueOverTimeRules, validate, getRevenueOverTime);

// GET /api/admin/analytics/best-sellers?from=&to=&limit=
router.get("/best-sellers", limitRules, validate, getBestSellingProducts);

// GET /api/admin/analytics/sales-by-category?from=&to=
router.get("/sales-by-category", dateRangeRules, validate, getSalesByCategory);

// GET /api/admin/analytics/top-customers?from=&to=&limit=
router.get("/top-customers", limitRules, validate, getTopCustomers);

// GET /api/admin/analytics/customers/breakdown?from=&to=
router.get(
  "/customers/breakdown",
  dateRangeRules,
  validate,
  getCustomerBreakdown,
);

// GET /api/admin/analytics/orders/status-breakdown?from=&to=
router.get(
  "/orders/status-breakdown",
  dateRangeRules,
  validate,
  getOrderStatusBreakdown,
);

export default router;
