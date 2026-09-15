const { Notification } = require("../models");

// Fire-and-forget by design (callers wrap with .catch(() => {}) if they
// don't want a notification failure to break the main action) — kept as
// a simple direct create here since Notification writes are cheap and a
// failure here shouldn't roll back e.g. an order status update.
const createNotification = async (userId, type, title, message, metadata = {}) => {
  if (!userId) return null; // guest — nothing to notify in-app
  return Notification.create({ userId, type, title, message, metadata });
};

module.exports = { createNotification };
