import express from "express";

import inventoryController from "../../controllers/admin/inventory.controller.js";

import { adjustStockRules } from "../../validators/admin.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { protect } from "../../middlewares/auth.middleware.js";

import  restrictTo  from "../../middlewares/admin.middleware.js";

const router = express.Router();
router.use(protect, restrictTo("ADMIN"));

router.get("/", inventoryController.listInventory);
router.get("/low-stock", inventoryController.listLowStock);
router.get("/:productId/history", inventoryController.getHistory);
router.patch("/:productId/stock", adjustStockRules, validate, inventoryController.adjustStock);

export default router;
