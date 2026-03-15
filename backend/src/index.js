import app from "./app.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/dbConnect.js";
import { connectPostgres } from "./db/pgConnect.js";

// Load environment variables
dotenv.config();

// Cache for database connections (optional but recommended for serverless)
let pgPool = null;
let mongoConnection = null;

/**
 * Initialize PostgreSQL connection (with caching)
 */
async function initPostgres() {
  if (!pgPool) {
    console.log("🔄 Initializing PostgreSQL connection...");
    pgPool = await connectPostgres(); // assuming connectPostgres returns a pool
    console.log("✅ PostgreSQL connected");
  }
  return pgPool;
}

/**
 * Initialize MongoDB connection (with caching)
 */
async function initMongoDB() {
  if (!mongoConnection) {
    console.log("🔄 Initializing MongoDB connection...");
    mongoConnection = await connectMongoDB(); // assuming connectMongoDB returns a connection
    console.log("✅ MongoDB connected");
  }
  return mongoConnection;
}

/**
 * Initialize both databases – runs once per cold start.
 * Errors are logged but do not prevent the function from exporting.
 */
async function initializeDatabases() {
  try {
    await Promise.all([initPostgres(), initMongoDB()]);
    console.log("✅ All databases initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    // In serverless, we may still export the app; requests will fail until connections succeed.
    // Consider implementing a health check or retry logic.
  }
}

// Start database initialization (non‑blocking)
initializeDatabases();

// =====================================================
// Vercel requires the Express app to be exported as default
// =====================================================
export default app;