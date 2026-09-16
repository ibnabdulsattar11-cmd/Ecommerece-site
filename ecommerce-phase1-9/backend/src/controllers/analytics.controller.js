'use strict';

const analyticsService = require('../../../../phase10-analytics/src/services/analytics.service');
const { resolveDateRange } = require('../../../../phase10-analytics/src/utils/dateRange.util');

// Small wrapper so every handler below can stay a clean one-liner
// and still forward errors to the central error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const getOverview = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getOverview(range);
  res.status(200).json({ success: true, data });
});

const getRevenueOverTime = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const groupBy = req.query.groupBy || 'day';
  const data = await analyticsService.getRevenueOverTime({ ...range, groupBy });
  res.status(200).json({ success: true, groupBy, data });
});

const getBestSellingProducts = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const limit = req.query.limit || 10;
  const data = await analyticsService.getBestSellingProducts({ ...range, limit });
  res.status(200).json({ success: true, data });
});

const getSalesByCategory = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getSalesByCategory(range);
  res.status(200).json({ success: true, data });
});

const getTopCustomers = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const limit = req.query.limit || 10;
  const data = await analyticsService.getTopCustomers({ ...range, limit });
  res.status(200).json({ success: true, data });
});

const getCustomerBreakdown = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getNewVsReturningCustomers(range);
  res.status(200).json({ success: true, data });
});

const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getOrderStatusBreakdown(range);
  res.status(200).json({ success: true, data });
});

module.exports = {
  getOverview,
  getRevenueOverTime,
  getBestSellingProducts,
  getSalesByCategory,
  getTopCustomers,
  getCustomerBreakdown,
  getOrderStatusBreakdown,
};
