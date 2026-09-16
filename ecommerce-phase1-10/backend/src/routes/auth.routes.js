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

const router = express.Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

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
