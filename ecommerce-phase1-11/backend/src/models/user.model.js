import { DataTypes } from "sequelize";

export default  (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: true, unique: true },
      password: { type: DataTypes.STRING, allowNull: true }, // null for OAuth-only users
      googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
      profileImage: { type: DataTypes.STRING, allowNull: true },
      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        defaultValue: "USER",
      },
      language: {
        type: DataTypes.ENUM("en", "ar"),
        defaultValue: "en",
      },
      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },

      // Email verification
      emailVerifyToken: { type: DataTypes.STRING, allowNull: true },
      emailVerifyExpires: { type: DataTypes.DATE, allowNull: true },

      // Password reset (single-use, expiring)
      resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
      resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },

      // Refresh token rotation
      refreshTokenHash: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "users",
      indexes: [{ fields: ["email"] }, { fields: ["phone"] }],
    },
  );

  return User;
};
