module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    'CartItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      cartId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
      variantId: { type: DataTypes.UUID, allowNull: true },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
      },
      // price snapshot at the time the item was added, so cart totals don't
      // silently shift if the product price changes while it sits in cart
      unitPriceSnapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'cart_items',
      timestamps: true,
      indexes: [
        // one row per (cart, product, variant) combo — repeat add-to-cart
        // just bumps quantity instead of creating duplicate rows
        { unique: true, fields: ['cartId', 'productId', 'variantId'] },
      ],
    }
  );

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart' });
    CartItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    CartItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
  };

  return CartItem;
};
