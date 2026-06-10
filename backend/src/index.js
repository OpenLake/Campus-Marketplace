import app from "./app.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/dbConnect.js";
import { connectPostgres } from "./db/pgConnect.js";

console.log("🚀 Server file is starting ...");
console.log("Current directory:", process.cwd());
console.log("Node version:", process.version);

dotenv.config({ quiet: true });
const PORT = process.env.PORT || 4000;
console.log("PORT from env:", PORT);

// Initialize both databases
const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL  
    console.log("📊 Connecting to PostgreSQL...");
    await connectPostgres();
    console.log("✅ PostgreSQL connected");
    
    // 2. Connect to MongoDB  
    console.log("🍃 Connecting to MongoDB...");
    await connectMongoDB();
    console.log("✅ MongoDB connected");
    
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
process.on('uncaughtException', (err) => {
  console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Start the server
startServer();