const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Return = sequelize.define(
    "Return",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reason: { type: DataTypes.TEXT, allowNull: false },
      itemsReturned: { type: DataTypes.JSONB, allowNull: false }, // [{orderItemId, quantity}]
      status: {
        type: DataTypes.ENUM(
          "requested",
          "approved",
          "rejected",
          "received",
          "completed",
        ),
        defaultValue: "requested",
      },
      refundStatus: {
        type: DataTypes.ENUM(
          "not_applicable",
          "pending",
          "processing",
          "refunded",
        ),
        defaultValue: "not_applicable",
      },
      refundAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      adminNote: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "returns" },
  );

  return Return;
};
