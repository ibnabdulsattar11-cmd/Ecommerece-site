const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Mirrors one of Order.status's enum values at the moment it changed —
      // kept as a plain STRING (not ENUM) here so this table never needs a
      // migration if the Order status enum grows later.
      status: { type: DataTypes.STRING, allowNull: false },
      note: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "order_status_history" },
  );

  return OrderStatusHistory;
};
