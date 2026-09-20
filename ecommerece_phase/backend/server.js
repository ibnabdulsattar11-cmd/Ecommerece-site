import "dotenv/config";
import validateEnv from "./src/config/validateEnv.js";
validateEnv();

import app from "./src/app.js";
import { sequelize, connectDB } from "./src/config/db.js";
import "./src/models/index.js"; // load models & associations
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // In development you can sync models directly.
  // In production, always use migrations instead of sync({ alter: true }).
  if (process.env.NODE_ENV === "development") {
    await sequelize.sync({ alter: true });
    console.log("📦 Models synced");
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received: closing server gracefully...`);
    server.close(async () => {
      try {
        await sequelize.close();
        console.log("✅ Server and DB connections closed");
        process.exit(0);
      } catch (err) {
        logger.error("Error during shutdown", { message: err.message });
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error("⏱  Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
      message: reason?.message || String(reason),
    });
  });
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
};

startServer();
