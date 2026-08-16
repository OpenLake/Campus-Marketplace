import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { supabase } from "../db/supabaseClient.js";
import { isRedisReady } from "../db/redis.js";

const healthCheck = asyncHandler(async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;

  let isPostgresConnected = false;
  try {
    const { error } = await supabase.from('users').select('user_id').limit(1);
    if (error) {
      console.error("Supabase healthcheck error:", error);
    }
    isPostgresConnected = !error;
  } catch (err) {
    console.error("Supabase connection error:", err);
    isPostgresConnected = false;
  }

  const redisReady = isRedisReady();

  // Redis failure doesn't cause a 503 since the system degrades gracefully
  const isHealthy = isMongoConnected && isPostgresConnected;

  if (!isHealthy) {
    return res.status(503).json(new ApiResponse(503, {
      mongodb: isMongoConnected,
      postgres: isPostgresConnected,
      redis: redisReady
    }, "Service Unavailable"));
  }

  res.status(200).json(new ApiResponse(200, {
    mongodb: isMongoConnected,
    postgres: isPostgresConnected,
    redis: redisReady
  }, "Server is running and healthy"));
});

export { healthCheck };
