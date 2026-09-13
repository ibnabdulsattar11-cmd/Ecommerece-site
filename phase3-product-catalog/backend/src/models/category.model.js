module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nameEn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameAr: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      descriptionEn: DataTypes.TEXT,
      descriptionAr: DataTypes.TEXT,
      image: DataTypes.STRING,
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'categories',
      timestamps: true,
    }
  );

  Category.associate = (models) => {
    // self-referencing for subcategories
    Category.hasMany(models.Category, {
      as: 'children',
      foreignKey: 'parentId',
    });
    Category.belongsTo(models.Category, {
      as: 'parent',
      foreignKey: 'parentId',
    });

    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products',
    });
  };

  return Category;
};
