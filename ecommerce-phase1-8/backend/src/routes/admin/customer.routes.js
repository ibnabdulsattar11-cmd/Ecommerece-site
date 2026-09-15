const express = require("express");
const router = express.Router();

const customerController = require("../../controllers/admin/customer.controller");
const { setBlockedRules, setRoleRules } = require("../../validators/admin.validator");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", customerController.listCustomers);
router.get("/:id", customerController.getCustomerById);
router.patch("/:id/block", setBlockedRules, validate, customerController.setBlocked);
router.patch("/:id/role", setRoleRules, validate, customerController.setRole);

module.exports = router;
