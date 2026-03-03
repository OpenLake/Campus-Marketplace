import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { errorHandler } from "./middlewares/error.middleware.js";

// Import all routes
<<<<<<< HEAD
// import heathcheckRouter from "./routes/healthcheck.route.js";
 import userRouter from "./routes/users.routes.js";
// import listingRouter from "./routes/listing.routes.js";
=======
import heathcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/users.routes.js";
import listingRouter from "./routes/listing.routes.js";
import orderRouter from "./routes/order.routes.js"; 
import authRouter from "./routes/auth.routes.js";
>>>>>>> refs/remotes/origin/main


const app = express();

// --- 1. Global Middleware (Order matters!) ---

// Body Parsers (Must be at the top so controllers can read req.body)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

<<<<<<< HEAD
// API routes
// app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
// app.use("/api/listings", listingRouter);
 

// app.use(errorHandler);

export default app;
 
=======
// Cookie Parser (Must be before CORS and routes to handle tokens)
app.use(cookieParser()); 

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

// --- 2. API Routes ---

app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
app.use("/api/listings", listingRouter);
app.use("/api/orders", orderRouter);
app.use("/api/auth", authRouter);

// --- 3. Error Handling (Must be the last middleware) ---

app.use(errorHandler);

export default app;
>>>>>>> refs/remotes/origin/main
