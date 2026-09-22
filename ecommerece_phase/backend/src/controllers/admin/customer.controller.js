import { Op, fn, col } from "sequelize";

import { User, Address, Order } from "../../models/index.js";

import ApiError from "../../utils/ApiError.js";

import ApiResponse from "../../utils/ApiResponse.js";

const safeAttributes = {
  exclude: [
    "password",
    "refreshTokenHash",
    "resetPasswordToken",
    "emailVerifyToken",
  ],
};

// GET /api/admin/customers?search=&isBlocked=&page=&limit=
const listCustomers = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const where = { role: "USER" };
  if (req.query.search) {
    const term = `%${req.query.search}%`;
    where[Op.or] = [
      { name: { [Op.iLike]: term } },
      { email: { [Op.iLike]: term } },
      { phone: { [Op.iLike]: term } },
    ];
  }
  if (req.query.isBlocked !== undefined)
    where.isBlocked = req.query.isBlocked === "true";

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: safeAttributes,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  const response = new ApiResponse(200, rows);
  response.pagination = {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
  res.status(200).json(response);
};

// GET /api/admin/customers/:id — profile + order stats + addresses + recent orders
const getCustomerById = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id, role: "USER" },
    attributes: safeAttributes,
    include: [{ model: Address }],
  });
  if (!user) throw new ApiError(404, "Customer not found");

  const [stats] = await Order.findAll({
    attributes: [
      [fn("COUNT", col("id")), "orderCount"],
      [fn("COALESCE", fn("SUM", col("total")), 0), "totalSpent"],
      [fn("MAX", col("createdAt")), "lastOrderAt"],
    ],
    where: { userId: user.id, status: { [Op.ne]: "cancelled" } },
    raw: true,
  });

  const recentOrders = await Order.findAll({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  res.status(200).json(
    new ApiResponse(200, {
      user,
      stats: {
        orderCount: parseInt(stats.orderCount, 10),
        totalSpent: parseFloat(stats.totalSpent),
        lastOrderAt: stats.lastOrderAt,
      },
      recentOrders,
    }),
  );
};

// PATCH /api/admin/customers/:id/block   { blocked: true|false }
const setBlocked = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id, role: "USER" },
  });
  if (!user) throw new ApiError(404, "Customer not found");

  user.isBlocked = !!req.body.blocked;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: user.id, isBlocked: user.isBlocked },
        user.isBlocked ? "Customer blocked" : "Customer unblocked",
      ),
    );
};

// PATCH /api/admin/customers/:id/role   { role: "USER" | "ADMIN" }
const setRole = async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.role = req.body.role;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, { id: user.id, role: user.role }, "Role updated"),
    );
};

export { listCustomers, getCustomerById, setBlocked, setRole };
export default { listCustomers, getCustomerById, setBlocked, setRole };
