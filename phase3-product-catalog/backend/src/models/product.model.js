module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nameEn: { type: DataTypes.STRING, allowNull: false },
      nameAr: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      descEn: DataTypes.TEXT,
      descAr: DataTypes.TEXT,
      sku: { type: DataTypes.STRING, allowNull: false, unique: true },
      brand: DataTypes.STRING,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      salePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      categoryId: { type: DataTypes.UUID, allowNull: false },
      status: {
        type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'INACTIVE'),
        defaultValue: 'DRAFT',
      },
      avgRating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
      reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      // used for search - populated on create/update hooks
      searchVector: DataTypes.TEXT,
    },
    {
      tableName: 'products',
      timestamps: true,
      indexes: [
        { fields: ['categoryId'] },
        { fields: ['status'] },
        { fields: ['slug'] },
        { fields: ['price'] },
      ],
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Product.hasMany(models.ProductImage, {
      foreignKey: 'productId',
      as: 'images',
      onDelete: 'CASCADE',
    });
    Product.hasMany(models.ProductVariant, {
      foreignKey: 'productId',
      as: 'variants',
      onDelete: 'CASCADE',
    });
    if (models.Review) {
      Product.hasMany(models.Review, {
        foreignKey: 'productId',
        as: 'reviews',
      });
    }
    if (models.Wishlist) {
      Product.hasMany(models.Wishlist, {
        foreignKey: 'productId',
      });
    }
  };

  return Product;
};
