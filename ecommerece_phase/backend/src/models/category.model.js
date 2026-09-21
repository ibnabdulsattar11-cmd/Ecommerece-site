import { DataTypes } from "sequelize";

export default (sequelize) => {
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
      descriptionEn: { type: DataTypes.TEXT, allowNull: true },
      descriptionAr: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: true },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
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
