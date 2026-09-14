const express = require("express");
const router = express.Router();

const adminOrderController = require("../../controllers/admin/order.controller");
const { statusUpdateRules } = require("../../validators/orderTracking.validator");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", adminOrderController.listOrders);
router.patch("/:id/status", statusUpdateRules, validate, adminOrderController.updateOrderStatus);

module.exports = router;
