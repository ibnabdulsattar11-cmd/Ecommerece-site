const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InventoryLog = sequelize.define(
    "InventoryLog",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      changeType: {
        type: DataTypes.ENUM("restock", "correction", "return", "damage", "other"),
        allowNull: false,
      },
      quantityChange: { type: DataTypes.INTEGER, allowNull: false }, // signed: +10 restock, -2 damage
      previousStock: { type: DataTypes.INTEGER, allowNull: false },
      newStock: { type: DataTypes.INTEGER, allowNull: false },
      note: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "inventory_logs" }
  );

  return InventoryLog;
};
