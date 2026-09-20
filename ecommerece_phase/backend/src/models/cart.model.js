import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: true }, // null for guest cart
      guestToken: { type: DataTypes.STRING, allowNull: true, unique: true }, // stored in cookie for guests
    },
    { tableName: "carts" },
  );

  return Cart;
};
