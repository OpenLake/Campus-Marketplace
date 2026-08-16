import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

export const connectRedis = async () => {
  if (process.env.REDIS_CACHE_ENABLED !== "true") {
    console.log("ℹ️ Redis cache is explicitly disabled via REDIS_CACHE_ENABLED");
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("⚠️ REDIS_CACHE_ENABLED is true, but REDIS_URL is not set. Running without Redis.");
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS) || 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max reconnect retries reached');
          return Math.min(retries * 50, 2000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
      console.log('✅ Redis client ready');
    });

    redisClient.on('end', () => {
      console.log('ℹ️ Redis client connection closed');
      isRedisConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error.message);
    // Don't throw, just fail safely to allow the app to run in degraded mode.
    isRedisConnected = false;
    redisClient = null;
    return null;
  }
};

export const getRedisClient = () => redisClient;
export const isRedisReady = () => isRedisConnected;

export const closeRedis = async () => {
  if (redisClient && isRedisConnected) {
    await redisClient.quit();
  }
};
