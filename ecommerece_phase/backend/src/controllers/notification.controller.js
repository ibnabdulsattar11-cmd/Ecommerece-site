import { Notification } from "../models/index.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

// GET /api/notifications?page=&limit=&unreadOnly=true
const listMyNotifications = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const where = { userId: req.user.id };
  if (req.query.unreadOnly === "true") where.isRead = false;

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  const unreadCount = await Notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  const response = new ApiResponse(200, rows);
  response.pagination = {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };
  response.unreadCount = unreadCount;
  res.status(200).json(response);
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) throw new ApiError(404, "Notification not found");

  notification.isRead = true;
  await notification.save();

  res.status(200).json(new ApiResponse(200, notification));
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } },
  );
  res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  const deleted = await Notification.destroy({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!deleted) throw new ApiError(404, "Notification not found");
  res.status(200).json(new ApiResponse(200, null, "Notification deleted"));
};

export { listMyNotifications, markRead, markAllRead, deleteNotification };
export default {
  listMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};
