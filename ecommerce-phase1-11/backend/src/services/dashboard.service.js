import { Op, fn, col, literal } from "sequelize";
import {
  sequelize,
  Order,
  OrderItem,
  Product,
  User,
  Review,
  Return,
} from "../models";

// Orders in these statuses represent real, counted revenue. "cancelled"
// orders never collected money (or were refunded) so they're excluded.
// COD orders count here even before cash is physically collected, since
// the order itself is confirmed — adjust this list if you'd rather only
// count orders that are actually paymentStatus = "paid".
const REVENUE_EXCLUDED_STATUSES = ["cancelled"];

const getSummary = async () => {
  const [revenueRow] = await Order.findAll({
    attributes: [
      [fn("COALESCE", fn("SUM", col("total")), 0), "totalRevenue"],
      [fn("COUNT", col("id")), "orderCount"],
    ],
    where: { status: { [Op.notIn]: REVENUE_EXCLUDED_STATUSES } },
    raw: true,
  });

  const ordersByStatus = await Order.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });

  const customersCount = await User.count({ where: { role: "USER" } });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newCustomersThisWeek = await User.count({
    where: { role: "USER", createdAt: { [Op.gte]: sevenDaysAgo } },
  });

  const pendingReviews = await Review.count({ where: { status: "pending" } });
  const pendingReturns = await Return.count({
    where: { status: ["requested", "approved", "received"] },
  });

  const lowStockThreshold = parseInt(
    process.env.LOW_STOCK_THRESHOLD || "5",
    10,
  );
  const lowStockCount = await Product.count({
    where: { status: "active", stock: { [Op.lte]: lowStockThreshold } },
  });

  return {
    totalRevenue: parseFloat(revenueRow.totalRevenue),
    orderCount: parseInt(revenueRow.orderCount, 10),
    ordersByStatus: Object.fromEntries(
      ordersByStatus.map((r) => [r.status, parseInt(r.count, 10)]),
    ),
    customersCount,
    newCustomersThisWeek,
    pendingReviews,
    pendingReturns,
    lowStockCount,
  };
};

// Daily revenue + order count for the last `days` days — enough for a
// simple line chart on the dashboard.
const getRevenueTimeseries = async (days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await Order.findAll({
    attributes: [
      [fn("DATE", col("createdAt")), "date"],
      [fn("COALESCE", fn("SUM", col("total")), 0), "revenue"],
      [fn("COUNT", col("id")), "orders"],
    ],
    where: {
      status: { [Op.notIn]: REVENUE_EXCLUDED_STATUSES },
      createdAt: { [Op.gte]: since },
    },
    group: [fn("DATE", col("createdAt"))],
    order: [[fn("DATE", col("createdAt")), "ASC"]],
    raw: true,
  });

  return rows.map((r) => ({
    date: r.date,
    revenue: parseFloat(r.revenue),
    orders: parseInt(r.orders, 10),
  }));
};

// Best sellers by units sold + revenue generated, from OrderItem (which
// has the price locked at purchase time — never re-derives from the
// product's current price).
const getTopProducts = async (limit = 10) => {
  const rows = await OrderItem.findAll({
    attributes: [
      "productId",
      [fn("SUM", col("quantity")), "unitsSold"],
      [fn("SUM", literal(`"quantity" * "paidUnitPrice"`)), "revenue"],
    ],
    include: [
      {
        model: Order,
        where: { status: { [Op.notIn]: REVENUE_EXCLUDED_STATUSES } },
        attributes: [],
      },
    ],
    group: ["OrderItem.productId"],
    order: [[literal('"unitsSold"'), "DESC"]],
    limit,
    raw: true,
  });

  const productIds = rows.map((r) => r.productId);
  const products = await Product.findAll({
    where: { id: productIds },
    attributes: ["id", "nameEn", "slug", "stock"],
  });
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  return rows.map((r) => ({
    product: productById[r.productId] || null,
    unitsSold: parseInt(r.unitsSold, 10),
    revenue: parseFloat(r.revenue),
  }));
};

const getRecentOrders = async (limit = 10) => {
  return Order.findAll({
    include: [{ model: User, attributes: ["id", "name", "email"] }],
    order: [["createdAt", "DESC"]],
    limit,
  });
};

const getLowStockProducts = async (limit = 20) => {
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "5", 10);
  return Product.findAll({
    where: { status: "active", stock: { [Op.lte]: threshold } },
    order: [["stock", "ASC"]],
    limit,
    attributes: ["id", "nameEn", "slug", "stock", "sku"],
  });
};

export default{
  getSummary,
  getRevenueTimeseries,
  getTopProducts,
  getRecentOrders,
  getLowStockProducts,
};
