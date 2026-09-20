import ApiError from "../utils/ApiError.js";

import { verifyAccessToken } from "../utils/token.js";

import { User } from "../models/index.js";
// Verifies the access token from the Authorization header and attaches
// the authenticated user to req.user. Does NOT touch the refresh token.
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findByPk(decoded.id, {
    attributes: {
      exclude: [
        "password",
        "refreshTokenHash",
        "resetPasswordToken",
        "emailVerifyToken",
      ],
    },
  });

  if (!user) throw new ApiError(401, "User no longer exists");
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked");

  req.user = user;
  next();
};

// Optionally attaches req.user if a valid token is present, but never blocks
// the request (useful for e.g. guest cart merge checks).
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  try {
    const decoded = verifyAccessToken(authHeader.split(" ")[1]);
    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: [
          "password",
          "refreshTokenHash",
          "resetPasswordToken",
          "emailVerifyToken",
        ],
      },
    });
    if (user && !user.isBlocked) req.user = user;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
};

export  { protect, optionalAuth };
