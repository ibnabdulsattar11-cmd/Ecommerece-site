module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      addressId: { type: DataTypes.UUID, allowNull: false },

      // snapshot of the address at order time — if the user later edits/
      // deletes the saved address, the order still shows what it shipped to
      shippingSnapshot: { type: DataTypes.JSONB, allowNull: false },

      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      shipping: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      couponId: { type: DataTypes.UUID, allowNull: true },
      couponCode: { type: DataTypes.STRING, allowNull: true },

      status: {
        type: DataTypes.ENUM(
          'PENDING',      // created, awaiting payment confirmation (Stripe) or COD confirmation
          'PROCESSING',   // payment confirmed / COD accepted, being prepared
          'SHIPPED',
          'DELIVERED',
          'CANCELLED',
          'FAILED'        // payment failed / abandoned
        ),
        defaultValue: 'PENDING',
      },
      paymentMethod: {
        type: DataTypes.ENUM('STRIPE', 'COD'),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM('UNPAID', 'PAID', 'FAILED', 'REFUNDED'),
        defaultValue: 'UNPAID',
      },
      stripePaymentIntentId: { type: DataTypes.STRING, allowNull: true, unique: true },

      // stock was decremented for this order (guards against double-decrementing
      // if the webhook fires more than once, or against releasing twice on cancel)
      stockReserved: { type: DataTypes.BOOLEAN, defaultValue: false },

      placedAt: { type: DataTypes.DATE, allowNull: true },
      cancelledAt: { type: DataTypes.DATE, allowNull: true },
      cancelReason: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: 'orders',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['orderNumber'] },
      ],
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Address, { foreignKey: 'addressId', as: 'address' });
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items',
      onDelete: 'CASCADE',
    });
    if (models.Coupon) {
      Order.belongsTo(models.Coupon, { foreignKey: 'couponId', as: 'coupon' });
    }
    if (models.Return) {
      Order.hasMany(models.Return, { foreignKey: 'orderId', as: 'returns' });
    }
  };

  return Order;
};
