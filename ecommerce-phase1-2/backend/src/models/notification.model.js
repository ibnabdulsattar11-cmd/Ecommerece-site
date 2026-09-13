const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      type: {
        type: DataTypes.ENUM(
          "order_placed",
          "order_confirmed",
          "order_shipped",
          "order_delivered",
          "order_cancelled",
          "payment_confirmed",
          "return_update",
          "price_drop",
          "back_in_stock",
          "general"
        ),
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      metadata: { type: DataTypes.JSONB, defaultValue: {} }, // e.g. { orderId }
    },
    { tableName: "notifications" }
  );

  return Notification;
};
