const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", notificationController.listMyNotifications);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
