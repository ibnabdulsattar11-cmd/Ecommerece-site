const express = require("express");
const router = express.Router();

const dashboardController = require("../../controllers/admin/dashboard.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { restrictTo } = require("../../middlewares/admin.middleware");

router.use(protect, restrictTo("ADMIN"));

router.get("/", dashboardController.getDashboard);

module.exports = router;
