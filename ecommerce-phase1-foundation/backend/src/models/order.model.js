const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },

      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      shipping: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "return_requested",
          "returned",
          "refunded"
        ),
        defaultValue: "pending",
      },

      paymentMethod: {
        type: DataTypes.ENUM("cod", "stripe", "paypal", "jazzcash", "easypaisa", "bank_transfer"),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.ENUM("unpaid", "paid", "failed", "refunded"),
        defaultValue: "unpaid",
      },
      stripePaymentIntentId: { type: DataTypes.STRING, allowNull: true },

      couponCode: { type: DataTypes.STRING, allowNull: true },

      // Tracking (optional courier integration)
      trackingNumber: { type: DataTypes.STRING, allowNull: true },
      courierName: { type: DataTypes.STRING, allowNull: true },
      trackingUrl: { type: DataTypes.STRING, allowNull: true },
      estimatedDeliveryDate: { type: DataTypes.DATE, allowNull: true },

      // Snapshot of shipping address at time of order (address may change/delete later)
      shippingAddressSnapshot: { type: DataTypes.JSONB, allowNull: false },
    },
    {
      tableName: "orders",
      indexes: [{ fields: ["order_number"] }, { fields: ["status"] }],
    }
  );

  return Order;
};
