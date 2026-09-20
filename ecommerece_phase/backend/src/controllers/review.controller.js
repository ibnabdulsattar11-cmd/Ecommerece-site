import { Review, Product, User } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import {
  isVerifiedPurchase,
  recomputeProductRating,
} from "../services/review.service.js";

const reviewerInclude = { model: User, attributes: ["id", "name"] };

// GET /api/products/:productId/reviews?page=&limit=&rating=
// Public — only ever shows APPROVED reviews, plus a star-count breakdown.
const listProductReviews = async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const where = { productId, status: "approved" };
  if (req.query.rating) where.rating = parseInt(req.query.rating);

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [reviewerInclude],
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  const breakdownRaw = await Review.findAll({
    where: { productId, status: "approved" },
    attributes: ["rating"],
  });
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdownRaw.forEach((r) => breakdown[r.rating]++);

  const response = new ApiResponse(200, rows);
  response.pagination = {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
  response.breakdown = breakdown;
  res.status(200).json(response);
};

// POST /api/products/:productId/reviews  { rating, comment?, images? }
const createReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment, images } = req.body;

  const product = await Product.findByPk(productId);
  if (!product || product.status !== "active")
    throw new ApiError(404, "Product not found");

  const existing = await Review.findOne({
    where: { productId, userId: req.user.id },
  });
  if (existing)
    throw new ApiError(
      400,
      "You have already reviewed this product — edit your existing review instead",
    );

  const verified = await isVerifiedPurchase(req.user.id, productId);

  const review = await Review.create({
    productId,
    userId: req.user.id,
    rating,
    comment: comment || null,
    images: images || [],
    isVerifiedPurchase: verified,
    status: "pending", // goes live only after admin moderation
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        review,
        "Review submitted — it will be visible once approved",
      ),
    );
};

// PATCH /api/products/:productId/reviews/:id  { rating?, comment?, images? }
// Owner only. Editing sends it back through moderation.
const updateReview = async (req, res) => {
  const review = await Review.findOne({
    where: { id: req.params.id, productId: req.params.productId },
  });
  if (!review) throw new ApiError(404, "Review not found");
  if (review.userId !== req.user.id)
    throw new ApiError(403, "You can only edit your own review");

  const wasApproved = review.status === "approved";

  const { rating, comment, images } = req.body;
  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;
  review.status = "pending";
  await review.save();

  if (wasApproved) await recomputeProductRating(review.productId); // it no longer counts until re-approved

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        review,
        "Review updated — it will be re-reviewed before showing again",
      ),
    );
};

// DELETE /api/products/:productId/reviews/:id  (owner or admin)
const deleteReview = async (req, res) => {
  const review = await Review.findOne({
    where: { id: req.params.id, productId: req.params.productId },
  });
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = review.userId === req.user.id;
  const isAdmin = req.user.role === "ADMIN";
  if (!isOwner && !isAdmin)
    throw new ApiError(403, "You do not have permission to delete this review");

  const wasApproved = review.status === "approved";
  await review.destroy();

  if (wasApproved) await recomputeProductRating(review.productId);

  res.status(200).json(new ApiResponse(200, null, "Review deleted"));
};

// POST /api/products/:productId/reviews/:id/helpful  { helpful: true|false }
// Best-effort — there's no per-user vote table, so this doesn't stop
// someone voting more than once. Fine for a lightweight "was this
// helpful" signal; add a join table later if abuse becomes a problem.
const voteHelpful = async (req, res) => {
  const review = await Review.findOne({
    where: { id: req.params.id, productId: req.params.productId },
  });
  if (!review) throw new ApiError(404, "Review not found");

  const field = req.body.helpful ? "helpfulCount" : "notHelpfulCount";
  await review.increment(field);
  await review.reload();

  res.status(200).json(
    new ApiResponse(200, {
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount,
    }),
  );
};

export {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
};
export default {
  listProductReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
};
