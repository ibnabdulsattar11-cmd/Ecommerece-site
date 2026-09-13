const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CouponUsage = sequelize.define(
    "CouponUsage",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      discountApplied: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { tableName: "coupon_usages" }
  );

  return CouponUsage;
};
