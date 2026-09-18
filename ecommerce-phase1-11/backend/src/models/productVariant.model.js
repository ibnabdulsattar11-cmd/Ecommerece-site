import { DataTypes } from "sequelize";

export default  (sequelize) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      size: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: true },
      priceModifier: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      sku: { type: DataTypes.STRING, allowNull: true, unique: true },
    },
    { tableName: "product_variants" },
  );

  return ProductVariant;
};
