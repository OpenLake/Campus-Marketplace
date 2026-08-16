import app from "./app.js";
import dotenv from "dotenv";
import { connectPostgres } from "./db/pgConnect.js";
import { connectRedis, closeRedis } from "./db/redis.js";

console.log("🚀 Server file is starting ...");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);

dotenv.config({ quiet: true });
const PORT = process.env.PORT || 4000;
console.log("PORT from env:", PORT);

if (process.env.NODE_ENV === "production" && process.env.APP_MODE === "dev") {
  console.error("❌ CRITICAL: APP_MODE=dev cannot be used in production environment.");
  process.exit(1);
}

// Initialize both databases
const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL, MongoDB (via initDb) and Redis
    console.log("📊 Connecting to Databases...");
    await connectPostgres();
    await connectRedis();
    console.log("✅ Database connections established");

    // 3. Start the Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Listening on: http://0.0.0.0:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("Error stack:", error.stack);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  await closeRedis();
  process.exit(1);
});

// Graceful shutdown on SIGINT/SIGTERM
const shutdown = async () => {
  console.log('Gracefully shutting down...');
  await closeRedis();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the server
startServer();