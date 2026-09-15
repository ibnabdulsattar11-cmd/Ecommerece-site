const { Review, Product, User } = require("../../models");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const { recomputeProductRating } = require("../../services/review.service");

// GET /api/admin/reviews?status=pending&page=&limit=
const listReviews = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Product, attributes: ["id", "nameEn", "slug"] },
    ],
    order: [["createdAt", "ASC"]], // oldest-pending-first, matches a moderation queue
    limit,
    offset: (page - 1) * limit,
  });

  const response = new ApiResponse(200, rows);
  response.pagination = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
  res.status(200).json(response);
};

// PATCH /api/admin/reviews/:id/status  { status: "approved" | "rejected" }
const updateReviewStatus = async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  review.status = req.body.status;
  await review.save();

  await recomputeProductRating(review.productId);

  res.status(200).json(new ApiResponse(200, review, `Review ${req.body.status}`));
};

module.exports = { listReviews, updateReviewStatus };
