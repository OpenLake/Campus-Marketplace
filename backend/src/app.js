import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

// Import all routes
import heathcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/users.routes.js";
import listingRouter from "./routes/listing.routes.js";
import orderRouter from "./routes/order.routes.js"; 

const app = express();

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
app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
app.use("/api/listings", listingRouter);
app.use("/api/orders", orderRouter);

app.use(errorHandler);

export default app;