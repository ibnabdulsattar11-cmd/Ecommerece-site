module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      size: DataTypes.STRING,
      color: DataTypes.STRING,
      colorHex: DataTypes.STRING,
      sku: { type: DataTypes.STRING, unique: true },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      // added/subtracted from base product price
      priceModifier: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'product_variants',
      timestamps: true,
    }
  );

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return ProductVariant;
};
