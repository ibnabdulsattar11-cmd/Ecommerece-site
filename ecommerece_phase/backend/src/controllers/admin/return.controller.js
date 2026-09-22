import { Return, Order } from "../../models/index.js";

import ApiError from "../../utils/ApiError.js";

import ApiResponse from "../../utils/ApiResponse.js";

import orderTrackingService from "../../services/orderTracking.service.js";
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
const reviewReturn = async (req, res) => {
  const returnRequest = await Return.findByPk(req.params.id);
  if (!returnRequest) throw new ApiError(404, "Return request not found");

  const updated = await orderTrackingService.reviewReturn(
    returnRequest,
    req.body,
    req.user.id,
  );
  res.status(200).json(new ApiResponse(200, updated, "Return request updated"));
};

export { listReturns, reviewReturn };
export default { listReturns, reviewReturn };