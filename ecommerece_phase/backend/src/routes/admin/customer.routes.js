import express from "express";

import customerController from "../../controllers/admin/customer.controller.js";

import { setBlockedRules, setRoleRules } from "../../validators/admin.validator.js";

import validate from "../../middlewares/validate.middleware.js";

import { protect } from "../../middlewares/auth.middleware.js";

import { restrictTo } from "../../middlewares/admin.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("ADMIN"));

router.get("/", customerController.listCustomers);
router.get("/:id", customerController.getCustomerById);
router.patch("/:id/block", setBlockedRules, validate, customerController.setBlocked);
router.patch("/:id/role", setRoleRules, validate, customerController.setRole);

export default router;
