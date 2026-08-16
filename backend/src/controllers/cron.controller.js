import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { STRequest } from "../models/st_request.model.js";
import { STOrder } from "../models/st_order.model.js";
import mongoose from "mongoose";

export const verifyCronSecret = (req, res, next) => {
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    return next(new ApiError(401, "Unauthorized cron trigger"));
  }
  next();
};

export const runNightlyTasks = asyncHandler(async (req, res) => {
  // Stub implementation
  res.json(new ApiResponse(200, null, "Nightly tasks executed successfully"));
});
