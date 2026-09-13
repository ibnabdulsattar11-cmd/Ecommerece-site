module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    'Cart',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // null for guest carts, set once the visitor logs in / registers
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true, // one active cart per logged-in user
      },
      // random token stored in an httpOnly cookie for guest visitors
      guestToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName: 'carts',
      timestamps: true,
      validate: {
        eitherUserOrGuest() {
          if (!this.userId && !this.guestToken) {
            throw new Error('Cart must belong to either a user or a guest token');
          }
        },
      },
    }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Cart.hasMany(models.CartItem, {
      foreignKey: 'cartId',
      as: 'items',
      onDelete: 'CASCADE',
    });
  };

  return Cart;
};
