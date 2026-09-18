import express  from "express";
const router = express.Router();
import reviewController from "../controllers/review.controller.js";

import {
    createReviewRules,
    updateReviewRules,
    voteRules,
} from "../validators/review.validator.js";

import validate from "../middlewares/validate.middleware.js";

import { protect } from "../middlewares/auth.middleware.js";
router.get("/:productId/reviews", reviewController.listProductReviews);
router.post("/:productId/reviews", protect, createReviewRules, validate, reviewController.createReview);
router.patch("/:productId/reviews/:id", protect, updateReviewRules, validate, reviewController.updateReview);
router.delete("/:productId/reviews/:id", protect, reviewController.deleteReview);
router.post("/:productId/reviews/:id/helpful", protect, voteRules, validate, reviewController.voteHelpful);

export default router;
