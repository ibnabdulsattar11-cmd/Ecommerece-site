'use strict';

const router = require('express').Router();

const analyticsController = require('../controllers/analytics.controller');
const {
  dateRangeRules,
  revenueOverTimeRules,
  limitRules,
} = require('../validators/analytics.validator');

// These come from your existing Phase 2 auth work — adjust the require
// paths below if your middleware files live somewhere else.
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const validate = require('../middlewares/validate.middleware');

// Every analytics route is admin-only.
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/analytics/overview?from=&to=
router.get('/overview', dateRangeRules, validate, analyticsController.getOverview);

// GET /api/admin/analytics/revenue?from=&to=&groupBy=day|week|month
router.get('/revenue', revenueOverTimeRules, validate, analyticsController.getRevenueOverTime);

// GET /api/admin/analytics/best-sellers?from=&to=&limit=
router.get('/best-sellers', limitRules, validate, analyticsController.getBestSellingProducts);

// GET /api/admin/analytics/sales-by-category?from=&to=
router.get('/sales-by-category', dateRangeRules, validate, analyticsController.getSalesByCategory);

// GET /api/admin/analytics/top-customers?from=&to=&limit=
router.get('/top-customers', limitRules, validate, analyticsController.getTopCustomers);

// GET /api/admin/analytics/customers/breakdown?from=&to=
router.get('/customers/breakdown', dateRangeRules, validate, analyticsController.getCustomerBreakdown);

// GET /api/admin/analytics/orders/status-breakdown?from=&to=
router.get(
  '/orders/status-breakdown',
  dateRangeRules,
  validate,
  analyticsController.getOrderStatusBreakdown
);

module.exports = router;
