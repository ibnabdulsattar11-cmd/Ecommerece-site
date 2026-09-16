const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const orderTrackingController = require("../controllers/orderTracking.controller");
const { cancelOrderRules, returnRequestRules } = require("../validators/orderTracking.validator");
const validate = require("../middlewares/validate.middleware");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");

router.get("/", protect, orderController.getMyOrders);
router.get("/by-number/:orderNumber", optionalAuth, orderController.getOrderByNumber);
router.get("/:id", protect, orderController.getOrderById);

router.post("/:id/cancel", protect, cancelOrderRules, validate, orderTrackingController.cancelOrder);
router.post("/:id/return", protect, returnRequestRules, validate, orderTrackingController.requestReturn);

module.exports = router;
