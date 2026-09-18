import { DataTypes } from "sequelize";

export default  (sequelize) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      paidUnitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // price locked at purchase time
      productNameSnapshot: { type: DataTypes.STRING, allowNull: false }, // in case product is later edited/deleted
      variantSnapshot: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "order_items" },
  );

  return OrderItem;
};
