import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nameEn: { type: DataTypes.STRING, allowNull: false },
      nameAr: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      descriptionEn: { type: DataTypes.TEXT },
      descriptionAr: { type: DataTypes.TEXT },
      specifications: { type: DataTypes.JSONB, defaultValue: {} }, // flexible key-value specs
      brand: { type: DataTypes.STRING },
      sku: { type: DataTypes.STRING, allowNull: false, unique: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      salePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM("active", "draft", "out_of_stock", "INACTIVE" , "discontinued"),
        defaultValue: "active",
      },
      videoUrl: { type: DataTypes.STRING, allowNull: true },
      avgRating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
      reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: "products",
      indexes: [
        { fields: ["slug"] },
        { fields: ["sku"] },
        { fields: ["brand"] },
      ],
    },
  );

  return Product;
};
