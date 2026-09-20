import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Sequelize validation errors
  if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
    const messages = error.errors.map((e) => e.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }
  if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Never leak internal details in production
  const response = {
    success: false,
    message,
    errors: error.errors || [],
    requestId: req.id, // lets the client report a specific failing request
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  if (statusCode >= 500) {
    logger.error("Unhandled error", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
