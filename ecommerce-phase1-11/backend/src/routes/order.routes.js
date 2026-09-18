import express from "express";

import orderController from "../controllers/order.controller.js";

import orderTrackingController from "../controllers/orderTracking.controller.js";

import {
    cancelOrderRules,
    returnRequestRules,
} from "../validators/orderTracking.validator.js";

import validate from "../middlewares/validate.middleware.js";

import {
    protect,
    optionalAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", protect, orderController.getMyOrders);
router.get("/by-number/:orderNumber", optionalAuth, orderController.getOrderByNumber);
router.get("/:id", protect, orderController.getOrderById);

router.post("/:id/cancel", protect, cancelOrderRules, validate, orderTrackingController.cancelOrder);
router.post("/:id/return", protect, returnRequestRules, validate, orderTrackingController.requestReturn);

export default router;
