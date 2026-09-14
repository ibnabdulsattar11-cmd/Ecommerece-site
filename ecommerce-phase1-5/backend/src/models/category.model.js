const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nameEn: { type: DataTypes.STRING, allowNull: false },
      nameAr: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      image: { type: DataTypes.STRING, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true, // null = top-level category
      },
    },
    { tableName: "categories" },
  );

  return Category;
};
