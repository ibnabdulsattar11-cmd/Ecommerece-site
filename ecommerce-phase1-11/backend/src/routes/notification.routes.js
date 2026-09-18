import express from "express";

import notificationController from "../controllers/notification.controller.js";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(protect);

router.get("/", notificationController.listMyNotifications);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
