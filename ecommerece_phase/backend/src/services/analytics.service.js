"use strict";

import { Op, fn, col, literal } from "sequelize";

import { sequelize, Order, OrderItem, Product, Category, User, Return } from "../models/index.js";

import { previousPeriod, pctChange } from "../utils/dateRange.util.js";
// Orders in these statuses represent real, counted revenue.
// Cancelled orders and unpaid orders are excluded from every money figure.
const PAID_FILTER = { paymentStatus: "paid" };

/**
 * Postgres date_trunc bucket for a given grouping.
 * 'day' | 'week' | 'month'
 */
function truncatedDate(groupBy) {
  return fn("date_trunc", groupBy, col("Order.createdAt"));
}

async function getOverview({ from, to }) {
  const prev = previousPeriod({ from, to });

  const currentWhere = {
    ...PAID_FILTER,
    createdAt: { [Op.between]: [from, to] },
  };
  const previousWhere = {
    ...PAID_FILTER,
    createdAt: { [Op.between]: [prev.from, prev.to] },
  };

  const [current, previousStats] = await Promise.all([
    Order.findOne({
      attributes: [
        [fn("COALESCE", fn("SUM", col("total")), 0), "totalRevenue"],
        [fn("COUNT", col("id")), "totalOrders"],
        [fn("COALESCE", fn("AVG", col("total")), 0), "avgOrderValue"],
      ],
      where: currentWhere,
      raw: true,
    }),
    Order.findOne({
      attributes: [
        [fn("COALESCE", fn("SUM", col("total")), 0), "totalRevenue"],
        [fn("COUNT", col("id")), "totalOrders"],
      ],
      where: previousWhere,
      raw: true,
    }),
  ]);

  // Distinct paying customers in range (guest checkouts, if userId is null, are excluded here).
  const totalCustomers = await Order.count({
    distinct: true,
    col: "userId",
    where: { ...currentWhere, userId: { [Op.ne]: null } },
  });

  const totalReturns = await Return.count({
    where: { createdAt: { [Op.between]: [from, to] } },
  });

  const totalRevenue = Number(current.totalRevenue) || 0;
  const totalOrders = Number(current.totalOrders) || 0;
  const prevRevenue = Number(previousStats.totalRevenue) || 0;
  const prevOrders = Number(previousStats.totalOrders) || 0;

  return {
    range: { from, to },
    totalRevenue,
    totalOrders,
    avgOrderValue: Number(current.avgOrderValue) || 0,
    totalCustomers,
    totalReturns,
    revenueChangePct: pctChange(totalRevenue, prevRevenue),
    ordersChangePct: pctChange(totalOrders, prevOrders),
  };
}

async function getRevenueOverTime({ from, to, groupBy = "day" }) {
  const rows = await Order.findAll({
    attributes: [
      [truncatedDate(groupBy), "bucket"],
      [fn("COALESCE", fn("SUM", col("total")), 0), "revenue"],
      [fn("COUNT", col("id")), "orders"],
    ],
    where: {
      ...PAID_FILTER,
      createdAt: { [Op.between]: [from, to] },
    },
    group: ["bucket"],
    order: [[literal("bucket"), "ASC"]],
    raw: true,
  });

  return rows.map((r) => ({
    date: r.bucket,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}

async function getBestSellingProducts({ from, to, limit = 10 }) {
  const rows = await OrderItem.findAll({
    attributes: [
      "productId",
      [fn("SUM", col("OrderItem.quantity")), "unitsSold"],
      [
        fn(
          "SUM",
          literal('"OrderItem"."quantity" * "OrderItem"."paidUnitPrice"'),
        ),
        "revenue",
      ],
    ],
    include: [
      {
        model: Product,
        attributes: ["nameEn", "nameAr", "sku", "stock"],
        required: true,
      },
      {
        model: Order,
        attributes: [],
        required: true,
        where: {
          ...PAID_FILTER,
          createdAt: { [Op.between]: [from, to] },
        },
      },
    ],
    group: ["OrderItem.productId", "Product.id"],
    order: [[literal('"unitsSold"'), "DESC"]],
    limit,
    subQuery: false,
  });

  return rows.map((r) => ({
    productId: r.productId,
    nameEn: r.Product.nameEn,
    nameAr: r.Product.nameAr,
    sku: r.Product.sku,
    currentStock: r.Product.stock,
    unitsSold: Number(r.get("unitsSold")),
    revenue: Number(r.get("revenue")),
  }));
}

async function getSalesByCategory({ from, to }) {
  const rows = await OrderItem.findAll({
    attributes: [
      [col("Product.Category.id"), "categoryId"],
      [col("Product.Category.nameEn"), "categoryNameEn"],
      [col("Product.Category.nameAr"), "categoryNameAr"],
      [fn("SUM", col("OrderItem.quantity")), "unitsSold"],
      [
        fn(
          "SUM",
          literal('"OrderItem"."quantity" * "OrderItem"."paidUnitPrice"'),
        ),
        "revenue",
      ],
    ],
    include: [
      {
        model: Product,
        attributes: [],
        required: true,
        include: [{ model: Category, attributes: [], required: true }],
      },
      {
        model: Order,
        attributes: [],
        required: true,
        where: {
          ...PAID_FILTER,
          createdAt: { [Op.between]: [from, to] },
        },
      },
    ],
    group: ["Product.Category.id"],
    order: [[literal('"revenue"'), "DESC"]],
    subQuery: false,
  });

  return rows.map((r) => ({
    categoryId: r.get("categoryId"),
    categoryNameEn: r.get("categoryNameEn"),
    categoryNameAr: r.get("categoryNameAr"),
    unitsSold: Number(r.get("unitsSold")),
    revenue: Number(r.get("revenue")),
  }));
}

async function getTopCustomers({ from, to, limit = 10 }) {
  const rows = await Order.findAll({
    attributes: [
      "userId",
      [fn("COUNT", col("Order.id")), "ordersCount"],
      [fn("SUM", col("total")), "totalSpent"],
    ],
    include: [{ model: User, attributes: ["name", "email"], required: true }],
    where: {
      ...PAID_FILTER,
      createdAt: { [Op.between]: [from, to] },
      userId: { [Op.ne]: null },
    },
    group: ["Order.userId", "User.id"],
    order: [[literal('"totalSpent"'), "DESC"]],
    limit,
    subQuery: false,
  });

  return rows.map((r) => ({
    userId: r.userId,
    name: r.User.name,
    email: r.User.email,
    ordersCount: Number(r.get("ordersCount")),
    totalSpent: Number(r.get("totalSpent")),
  }));
}

async function getNewVsReturningCustomers({ from, to }) {
  // "New" = a customer whose first-ever paid order falls inside the range.
  // "Returning" = a customer who ordered in-range but had a paid order before `from`.
  const firstOrderPerUser = await Order.findAll({
    attributes: ["userId", [fn("MIN", col("createdAt")), "firstOrderAt"]],
    where: { ...PAID_FILTER, userId: { [Op.ne]: null } },
    group: ["userId"],
    raw: true,
  });

  const customersInRange = await Order.findAll({
    attributes: ["userId"],
    where: {
      ...PAID_FILTER,
      createdAt: { [Op.between]: [from, to] },
      userId: { [Op.ne]: null },
    },
    group: ["userId"],
    raw: true,
  });

  const firstOrderMap = new Map(
    firstOrderPerUser.map((r) => [r.userId, new Date(r.firstOrderAt)]),
  );

  let newCustomers = 0;
  let returningCustomers = 0;

  for (const { userId } of customersInRange) {
    const firstOrderAt = firstOrderMap.get(userId);
    if (firstOrderAt && firstOrderAt >= from && firstOrderAt <= to) {
      newCustomers += 1;
    } else {
      returningCustomers += 1;
    }
  }

  return {
    newCustomers,
    returningCustomers,
    totalCustomers: newCustomers + returningCustomers,
  };
}

async function getOrderStatusBreakdown({ from, to }) {
  const rows = await Order.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    where: { createdAt: { [Op.between]: [from, to] } },
    group: ["status"],
    raw: true,
  });

  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}

export { getOverview, getRevenueOverTime, getBestSellingProducts, getSalesByCategory, getTopCustomers, getNewVsReturningCustomers, getOrderStatusBreakdown };
export default { getOverview, getRevenueOverTime, getBestSellingProducts, getSalesByCategory, getTopCustomers, getNewVsReturningCustomers, getOrderStatusBreakdown };