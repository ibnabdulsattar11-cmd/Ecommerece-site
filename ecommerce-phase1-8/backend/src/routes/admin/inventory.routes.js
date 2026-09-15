const express = require("express");
const router = express.Router();

const inventoryController = require("../../controllers/admin/inventory.controller");
const { adjustStockRules } = require("../../validators/admin.validator");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", inventoryController.listInventory);
router.get("/low-stock", inventoryController.listLowStock);
router.get("/:productId/history", inventoryController.getHistory);
router.patch("/:productId/stock", adjustStockRules, validate, inventoryController.adjustStock);

module.exports = router;
