import dotenv from "dotenv";
dotenv.config();
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
import authRouter from "./routes/auth.routes.js";
>>>>>>> auth


const app = express();

// Global middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// API routes
// app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
<<<<<<< HEAD
// app.use("/api/listings", listingRouter);
 
=======
app.use("/api/listings", listingRouter);
app.use("/api/auth", authRouter);
>>>>>>> auth

// app.use(errorHandler);

export default app;
 