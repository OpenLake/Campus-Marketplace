import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import { errorHandler } from "./middlewares/error.middleware.js";

// Import all routes
// import heathcheckRouter from "./routes/healthcheck.route.js";
 import userRouter from "./routes/users.routes.js";
 import listingRouter from "./routes/listing.routes.js";


const allowedOrigins = [
  "http://localhost:4173",
  "http://172.19.0.5:4173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://campus-marketplace-frontend-psi.vercel.app"
];

if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, ""));
  allowedOrigins.push(...origins);
}

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                      /^https:\/\/campus-marketplace-.*\.vercel\.app$/.test(normalizedOrigin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Idempotency-Key"]
}));
import orderRouter from "./routes/order.routes.js"; 
// --- 1. Global Middleware (Order matters!) ---

// Body Parsers (Must be at the top so controllers can read req.body)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
// API routes
// app.use("/api/healthcheck", heathcheckRouter);
app.use("/api/users", userRouter);
app.use("/api/listings", listingRouter);
app.use("/api/orders", orderRouter);

// app.use(errorHandler);

export default app;
 
