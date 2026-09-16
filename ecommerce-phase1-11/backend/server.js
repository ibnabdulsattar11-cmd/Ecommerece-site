require("dotenv").config();
const validateEnv = require("./src/config/validateEnv"); // Phase 11
validateEnv();

const app = require("./src/app");
const { sequelize, connectDB } = require("./src/config/db");
require("./src/models"); // load models & associations
const logger = require("./src/utils/logger");

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

  // Phase 11: graceful shutdown — stop accepting new connections, let
  // in-flight requests finish, then close the DB pool cleanly. Without
  // this, a container orchestrator's SIGTERM during a deploy can kill
  // requests mid-flight and leave DB connections dangling.
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

    // Force-exit if graceful shutdown hangs (e.g. a stuck connection)
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
    process.exit(1); // process is in an undefined state after this — restart it
  });
};

startServer();
