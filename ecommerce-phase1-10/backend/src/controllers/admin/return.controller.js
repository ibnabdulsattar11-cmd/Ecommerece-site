const { Return, Order } = require("../../models");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const orderTrackingService = require("../../services/orderTracking.service");

// GET /api/admin/returns?status=
const listReturns = async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const returns = await Return.findAll({
    where,
    include: [{ model: Order }],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json(new ApiResponse(200, returns));
};

// PATCH /api/admin/returns/:id  { status, adminNote?, refundAmount? }
// status: "approved" | "rejected" | "received" | "completed"
const reviewReturn = async (req, res) => {
  const returnRequest = await Return.findByPk(req.params.id);
  if (!returnRequest) throw new ApiError(404, "Return request not found");

  const updated = await orderTrackingService.reviewReturn(returnRequest, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, updated, "Return request updated"));
};

module.exports = { listReturns, reviewReturn };
