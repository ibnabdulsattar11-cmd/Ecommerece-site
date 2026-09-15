const express = require("express");
const router = express.Router();

const adminReviewController = require("../../controllers/admin/review.controller");
const { moderationRules } = require("../../validators/review.validator");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", adminReviewController.listReviews);
router.patch("/:id/status", moderationRules, validate, adminReviewController.updateReviewStatus);

module.exports = router;
