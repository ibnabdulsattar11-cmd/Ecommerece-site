const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeliveryZone = sequelize.define(
    "DeliveryZone",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      country: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      area: { type: DataTypes.STRING, allowNull: true }, // null = whole city covered
      shippingCharge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
      estimatedDeliveryDays: { type: DataTypes.INTEGER, defaultValue: 3 },
    },
    { tableName: "delivery_zones" },
  );

  return DeliveryZone;
};
