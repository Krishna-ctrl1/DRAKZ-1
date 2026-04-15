// src/config/redis.config.js
const Redis = require("ioredis");

let redisClient = null;
let isRedisConnected = false;

const connectRedis = () => {
  const redisUri = process.env.REDIS_URI;

  if (!redisUri) {
    console.warn("⚠️  REDIS_URI not set — caching disabled");
    return null;
  }

  try {
    redisClient = new Redis(redisUri, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
      connectTimeout: 10000,
      lazyConnect: false,
    });

    redisClient.on("connect", () => {
      isRedisConnected = true;
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("error", (err) => {
      isRedisConnected = false;
      console.error("❌ Redis error:", err.message);
    });

    redisClient.on("close", () => {
      isRedisConnected = false;
    });

    return redisClient;
  } catch (err) {
    console.error("❌ Failed to initialize Redis:", err.message);
    return null;
  }
};

const getRedisClient = () => redisClient;
const isRedisReady = () => isRedisConnected && redisClient !== null;

module.exports = { connectRedis, getRedisClient, isRedisReady };
