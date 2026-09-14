module.exports = (sequelize, DataTypes) => {
  const CouponUsage = sequelize.define(
    'CouponUsage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      couponId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      orderId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      tableName: 'coupon_usages',
      timestamps: true,
    }
  );

  CouponUsage.associate = (models) => {
    CouponUsage.belongsTo(models.Coupon, { foreignKey: 'couponId' });
    CouponUsage.belongsTo(models.User, { foreignKey: 'userId' });
    CouponUsage.belongsTo(models.Order, { foreignKey: 'orderId' });
  };

  return CouponUsage;
};
