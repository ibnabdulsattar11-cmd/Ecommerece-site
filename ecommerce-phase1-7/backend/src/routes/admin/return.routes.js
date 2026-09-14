const express = require("express");
const router = express.Router();

const adminReturnController = require("../../controllers/admin/return.controller");
const { returnReviewRules } = require("../../validators/orderTracking.validator");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", adminReturnController.listReturns);
router.patch("/:id", returnReviewRules, validate, adminReturnController.reviewReturn);

module.exports = router;
