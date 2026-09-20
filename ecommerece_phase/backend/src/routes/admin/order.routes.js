import express from "express";

import adminOrderController from "../../controllers/admin/order.controller.js";

import { statusUpdateRules } from "../../validators/orderTracking.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { protect } from "../../middlewares/auth.middleware.js";

import { restrictTo } from "../../middlewares/admin.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("ADMIN"));

router.get("/", adminOrderController.listOrders);
router.patch("/:id/status", statusUpdateRules, validate, adminOrderController.updateOrderStatus);

export default router;
