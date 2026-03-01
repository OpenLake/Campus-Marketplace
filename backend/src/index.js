 
// src/index.js
import app from "./app.js";
<<<<<<< HEAD
import dotenv from "dotenv";
import connectMongoDB from "./db/dbConnect.js";  
import { connectPostgres } from "./db/pgConnect.js"; 
=======
import dotenv from "dotenv"; 
dotenv.config();
import connectDB from "./db/dbConnect.js";
>>>>>>> auth

console.log("🚀 Server file is starting ...");

dotenv.config({ quiet: true });
const PORT = process.env.PORT || 4000;

// Initialize both databases
const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL  
    console.log(" Connecting to PostgreSQL...");
    await connectPostgres();
    
    // 2. Connect to MongoDB  
    console.log(" Connecting to MongoDB...");
    await connectMongoDB();
    
    // 3. Start the Express server
    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(' UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Start the server
startServer();