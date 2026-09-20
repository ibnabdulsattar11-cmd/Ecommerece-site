import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// Refresh tokens are stored hashed in the DB so a leaked DB dump alone
// can't be replayed as a valid refresh token.
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Random opaque tokens for email verification / password reset links.
const generateRandomToken = () => crypto.randomBytes(32).toString("hex");

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken, generateRandomToken };