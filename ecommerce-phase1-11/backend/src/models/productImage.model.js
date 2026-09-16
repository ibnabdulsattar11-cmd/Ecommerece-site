const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductImage = sequelize.define(
    "ProductImage",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      url: { type: DataTypes.STRING, allowNull: false },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: "product_images" },
  );

  return ProductImage;
};
