const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const { createReviewRules, updateReviewRules, voteRules } = require("../validators/review.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

router.get("/:productId/reviews", reviewController.listProductReviews);
router.post("/:productId/reviews", protect, createReviewRules, validate, reviewController.createReview);
router.patch("/:productId/reviews/:id", protect, updateReviewRules, validate, reviewController.updateReview);
router.delete("/:productId/reviews/:id", protect, reviewController.deleteReview);
router.post("/:productId/reviews/:id/helpful", protect, voteRules, validate, reviewController.voteHelpful);

module.exports = router;
