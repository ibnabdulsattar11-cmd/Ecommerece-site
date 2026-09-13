module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'ProductImage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      thumbnailUrl: DataTypes.STRING,
      altTextEn: DataTypes.STRING,
      altTextAr: DataTypes.STRING,
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'product_images',
      timestamps: true,
    }
  );

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return ProductImage;
};
