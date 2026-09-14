const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      label: {
        type: DataTypes.ENUM("Home", "Office", "Other"),
        defaultValue: "Home",
      },
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      area: DataTypes.STRING,
      street: DataTypes.STRING,
      houseNo: DataTypes.STRING,
      postalCode: DataTypes.STRING,
      latitude: DataTypes.DECIMAL(10, 7),
      longitude: DataTypes.DECIMAL(10, 7),
      isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "addresses" },
  );

  return Address;
};
