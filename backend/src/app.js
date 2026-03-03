import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { errorHandler } from "./middlewares/error.middleware.js";

// Import all routes
// import heathcheckRouter from "./routes/healthcheck.route.js";
 import userRouter from "./routes/users.routes.js";
// import listingRouter from "./routes/listing.routes.js";


const app = express();
app.use(cors({
  origin: ['http://localhost:4173', 'http://172.19.0.5:4173'], // Your frontend URLs
  credentials: true, // Important for cookies/authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// --- 1. Global Middleware (Order matters!) ---

// Body Parsers (Must be at the top so controllers can read req.body)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// API routes
// app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
// app.use("/api/listings", listingRouter);
 

// app.use(errorHandler);

export default app;
 
