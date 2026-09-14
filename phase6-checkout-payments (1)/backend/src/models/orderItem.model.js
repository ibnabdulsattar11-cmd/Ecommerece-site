module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
      variantId: { type: DataTypes.UUID, allowNull: true },

      // snapshots — product name/image can change or the product can be
      // deleted later, but the order history must stay accurate forever
      productNameEnSnapshot: { type: DataTypes.STRING, allowNull: false },
      productNameArSnapshot: { type: DataTypes.STRING, allowNull: false },
      productImageSnapshot: { type: DataTypes.STRING, allowNull: true },
      variantLabelSnapshot: { type: DataTypes.STRING, allowNull: true }, // e.g. "Red / L"

      quantity: { type: DataTypes.INTEGER, allowNull: false },
      paidUnitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      lineTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    {
      tableName: 'order_items',
      timestamps: true,
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
  };

  return OrderItem;
};
