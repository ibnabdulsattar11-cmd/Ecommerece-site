const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      type: { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false },
      value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      minOrder: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      maxDiscount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      expiryDate: { type: DataTypes.DATE, allowNull: false },
      usageLimit: { type: DataTypes.INTEGER, allowNull: true }, // total uses allowed, null = unlimited
      usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      // Optional scoping
      isUserSpecific: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "coupons" },
  );

  return Coupon;
};
