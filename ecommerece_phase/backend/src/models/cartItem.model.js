import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    { tableName: "cart_items" },
  );

  return CartItem;
};
