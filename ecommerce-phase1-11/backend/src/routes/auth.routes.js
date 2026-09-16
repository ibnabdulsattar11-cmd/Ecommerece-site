const express = require("express");
const passport = require("../config/passport");
const {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  googleCallback,
} = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");
const csrfOriginCheck = require("../middlewares/csrfOriginCheck.middleware"); // Phase 11

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);

// FIX (Phase 11): these two authenticate purely off the httpOnly cookie —
// no Authorization header — which was previously both unrated-limited AND
// unchecked for cross-origin abuse. See csrfOriginCheck.middleware.js for
// why this is defense-in-depth rather than the primary protection.
router.post("/logout", authLimiter, csrfOriginCheck, logout);
router.post("/refresh", authLimiter, csrfOriginCheck, refresh);

router.post("/verify-email", verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  validate,
  resetPassword,
);
router.post(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword,
);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/en/login?error=google`,
  }),
  googleCallback,
);

module.exports = router;
