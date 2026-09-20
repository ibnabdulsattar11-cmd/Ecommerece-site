import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      notifyOnStock: { type: DataTypes.BOOLEAN, defaultValue: false },
      notifyOnPriceDrop: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "wishlists",
      indexes: [{ unique: true, fields: ["user_id", "product_id"] }],
    },
  );

  return Wishlist;
};
