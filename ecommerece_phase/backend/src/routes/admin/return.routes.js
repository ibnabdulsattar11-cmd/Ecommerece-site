import express from "express";

import adminReturnController from "../../controllers/admin/return.controller.js";

import { returnReviewRules } from "../../validators/orderTracking.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { protect } from "../../middlewares/auth.middleware.js";

import { restrictTo } from "../../middlewares/admin.middleware.js";

const router = express.Router();
router.use(protect, restrictTo("ADMIN"));

router.get("/", adminReturnController.listReturns);
router.patch("/:id", returnReviewRules, validate, adminReturnController.reviewReturn);

export default router;
