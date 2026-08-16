import { getRedisClient, isRedisReady } from "../db/redis.js";
import crypto from "crypto";

const LISTING_VERSION_KEY = "campus:v1:listings:version";

// Helper to get current cache version
export const getListingCacheVersion = async () => {
  if (!isRedisReady()) return "0";
  const client = getRedisClient();
  try {
    let version = await client.get(LISTING_VERSION_KEY);
    if (!version) {
      version = "1";
      await client.set(LISTING_VERSION_KEY, version);
    }
    return version;
  } catch (err) {
    return "0";
  }
};

// Increment version (invalidates all versioned cache keys)
export const invalidateListingCache = async () => {
  if (isRedisReady()) {
    const client = getRedisClient();
    try {
      await client.incr(LISTING_VERSION_KEY);
    } catch (err) {
      console.error("Redis invalidation error:", err.message);
    }
  }
};

export const getCachedData = async (keyPrefix, queryParams) => {
  if (!isRedisReady()) return null;
  const client = getRedisClient();
  
  // Hash the query string
  const queryString = JSON.stringify(queryParams || {});
  const queryHash = crypto.createHash("sha256").update(queryString).digest("hex");
  const version = await getListingCacheVersion();
  
  const cacheKey = `${keyPrefix}:${version}:${queryHash}`;
  
  try {
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis get error:", error.message);
    return null;
  }
};

export const setCachedData = async (keyPrefix, queryParams, data, ttlSeconds) => {
  if (!isRedisReady()) return;
  const client = getRedisClient();
  
  const queryString = JSON.stringify(queryParams || {});
  const queryHash = crypto.createHash("sha256").update(queryString).digest("hex");
  const version = await getListingCacheVersion();
  
  const cacheKey = `${keyPrefix}:${version}:${queryHash}`;
  
  try {
    await client.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Redis set error:", error.message);
  }
};
