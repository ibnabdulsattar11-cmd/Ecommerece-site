"use strict";
import analyticsService from "../services/analytics.service.js";
import resolveDateRange from "../utils/dateRange.util.js";

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getOverview = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getOverview(range);
  res.status(200).json({ success: true, data });
});

export const getRevenueOverTime = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const groupBy = req.query.groupBy || "day";
  const data = await analyticsService.getRevenueOverTime({ ...range, groupBy });
  res.status(200).json({ success: true, groupBy, data });
});

export const getBestSellingProducts = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const limit = req.query.limit || 10;
  const data = await analyticsService.getBestSellingProducts({
    ...range,
    limit,
  });
  res.status(200).json({ success: true, data });
});

export const getSalesByCategory = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getSalesByCategory(range);
  res.status(200).json({ success: true, data });
});

export const getTopCustomers = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const limit = req.query.limit || 10;
  const data = await analyticsService.getTopCustomers({ ...range, limit });
  res.status(200).json({ success: true, data });
});

export const getCustomerBreakdown = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getNewVsReturningCustomers(range);
  res.status(200).json({ success: true, data });
});

export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const range = resolveDateRange(req.query);
  const data = await analyticsService.getOrderStatusBreakdown(range);
  res.status(200).json({ success: true, data });
});
