import express from "express";

import dashboardController from "../../controllers/admin/dashboard.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";

import { restrictTo } from "../../middlewares/admin.middleware.js";

const router = express.Router();
router.use(protect, restrictTo("ADMIN"));

router.get("/", dashboardController.getDashboard);

export default router;
