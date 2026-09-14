module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    'Coupon',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          // store codes uppercase so lookups are case-insensitive by convention
          this.setDataValue('code', value.toUpperCase().trim());
        },
      },
      type: {
        type: DataTypes.ENUM('PERCENT', 'FIXED'),
        allowNull: false,
      },
      value: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // e.g. 10 (%) or 500 (PKR)
      minOrder: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      maxDiscount: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // cap for PERCENT coupons
      expiryDate: { type: DataTypes.DATE, allowNull: true },
      usageLimit: { type: DataTypes.INTEGER, allowNull: true }, // total redemptions allowed, null = unlimited
      usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      perUserLimit: { type: DataTypes.INTEGER, defaultValue: 1 }, // times a single user may use it
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'coupons',
      timestamps: true,
    }
  );

  Coupon.associate = (models) => {
    Coupon.hasMany(models.Order, { foreignKey: 'couponId' });
    Coupon.hasMany(models.CouponUsage, { foreignKey: 'couponId', as: 'usages' });
  };

  return Coupon;
};
