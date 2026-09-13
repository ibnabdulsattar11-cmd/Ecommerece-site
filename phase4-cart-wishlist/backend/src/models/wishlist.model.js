module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    'Wishlist',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
    },
    {
      tableName: 'wishlists',
      timestamps: true,
      indexes: [
        // a user can only wishlist a given product once
        { unique: true, fields: ['userId', 'productId'] },
      ],
    }
  );

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Wishlist.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return Wishlist;
};
