require("dotenv").config();
const app = require("./src/app");
const { sequelize, connectDB } = require("./src/config/db");
require("./src/models"); // load models & associations

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // In development you can sync models directly.
  // In production, always use migrations instead of sync({ alter: true }).
  if (process.env.NODE_ENV === "development") {
    await sequelize.sync({ alter: true });
    console.log("📦 Models synced");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
