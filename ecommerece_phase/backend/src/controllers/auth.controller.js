import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} from "../utils/token.js";

import { refreshCookieOptions } from "../utils/cookieOptions.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => {
  const {
    password,
    refreshTokenHash,
    resetPasswordToken,
    emailVerifyToken,
    ...safe
  } = user.toJSON();
  return safe;
};

const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  return accessToken;
};

/* ---------------------------- REGISTER ---------------------------- */
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({
    where: {
      [Op.or]: [email ? { email } : null, phone ? { phone } : null].filter(
        Boolean,
      ),
    },
  });
  if (existing)
    throw new ApiError(
      409,
      "An account with this email or phone already exists",
    );

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const emailVerifyToken = email ? generateRandomToken() : null;

  const user = await User.create({
    name,
    email: email || null,
    phone: phone || null,
    password: hashedPassword,
    emailVerifyToken,
    emailVerifyExpires: email
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null,
    isVerified: !email, 
  });

  if (email) {
    try {
      await sendVerificationEmail(user, emailVerifyToken);
    } catch (err) {

      console.error("Failed to send verification email:", err);
    }
  }

  const accessToken = await issueTokens(res, user);
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: sanitizeUser(user), accessToken },
        "Registered successfully",
      ),
    );
};

/* ------------------------------ LOGIN ------------------------------ */
const login = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email or phone

  const user = await User.findOne({
    where: { [Op.or]: [{ email: identifier }, { phone: identifier }] },
  });

  if (!user || !user.password) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked");

  const accessToken = await issueTokens(res, user);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizeUser(user), accessToken },
        "Logged in successfully",
      ),
    );
};

/* ------------------------------ LOGOUT ------------------------------ */
const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.update(
        { refreshTokenHash: null },
        { where: { id: decoded.id } },
      );
    } catch (err) {
    }
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
};

/* ------------------------- REFRESH TOKEN ------------------------- */
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findByPk(decoded.id);
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    throw new ApiError(
      401,
      "Refresh token has been revoked. Please log in again",
    );
  }

  const accessToken = await issueTokens(res, user);
  res
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Token refreshed"));
};

/* ---------------------------- VERIFY EMAIL ---------------------------- */
const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { [Op.gt]: new Date() },
    },
  });
  if (!user) throw new ApiError(400, "Invalid or expired verification link");

  user.isVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpires = null;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
};

/* ---------------------------- FORGOT PASSWORD ---------------------------- */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user) {
    const resetToken = generateRandomToken();
    user.resetPasswordToken = hashToken(resetToken); 
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If that email exists, a reset link has been sent",
      ),
    );
};

/* ---------------------------- RESET PASSWORD ---------------------------- */
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const user = await User.findOne({
    where: {
      resetPasswordToken: hashed,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });
  if (!user) throw new ApiError(400, "Invalid or expired reset link");

  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  user.resetPasswordToken = null; 
  user.resetPasswordExpires = null;
  user.refreshTokenHash = null; 
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset successfully. Please log in again",
      ),
    );
};

/* ---------------------------- CHANGE PASSWORD ---------------------------- */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  const isMatch = await bcrypt.compare(currentPassword, user.password || "");
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.refreshTokenHash = null; // invalidate existing sessions
  await user.save();

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed. Please log in again"));
};

/* ------------------------- GOOGLE OAUTH CALLBACK ------------------------- */
const googleCallback = async (req, res) => {
  const user = req.user;
  const accessToken = await issueTokens(res, user);
  res.redirect(
    `${process.env.CLIENT_URL}/${user.language || "en"}/auth/callback?accessToken=${accessToken}`,
  );
};

export {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  googleCallback,
  sanitizeUser,
};