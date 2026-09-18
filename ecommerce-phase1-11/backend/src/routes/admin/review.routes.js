import express from "express";

import adminReviewController from "../../controllers/admin/review.controller.js";

import { moderationRules } from "../../validators/review.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { protect } from "../../middlewares/auth.middleware.js";

import  restrictTo from "../../middlewares/admin.middleware.js";

const router = express.Router();
router.use(protect, restrictTo("ADMIN"));

router.get("/", adminReviewController.listReviews);
router.patch("/:id/status", moderationRules, validate, adminReviewController.updateReviewStatus);

export default router;
