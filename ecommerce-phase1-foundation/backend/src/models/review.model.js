const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Review = sequelize.define(
    "Review",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      comment: { type: DataTypes.TEXT, allowNull: true },
      images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      isVerifiedPurchase: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      helpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      notHelpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: "reviews" }
  );

  return Review;
};
