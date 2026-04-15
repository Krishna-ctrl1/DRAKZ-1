// src/middlewares/redisCache.middleware.js
const { getRedisClient, isRedisReady } = require("../config/redis.config");

/**
 * Redis cache middleware factory
 * @param {number} ttl - Time to live in seconds (default: 60)
 * @param {function} [keyGenerator] - Custom key generator (req) => string
 * @returns Express middleware
 */
const redisCache = (ttl = 60, keyGenerator = null) => {
  return async (req, res, next) => {
    if (!isRedisReady()) return next(); // graceful fallback

    const redis = getRedisClient();
    const key = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl}:${req.user?._id || "anon"}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        // Attach header so benchmark can detect cache hits
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Key", key);
        return res.json(JSON.parse(cached));
      }

      // Store original res.json to intercept response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Cache the response asynchronously (don't block response)
        redis.setex(key, ttl, JSON.stringify(data)).catch(() => {});
        res.set("X-Cache", "MISS");
        return originalJson(data);
      };

      next();
    } catch (err) {
      // If Redis fails, just skip caching
      console.error("Redis cache middleware error:", err.message);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., "cache:/api/blogs*")
 */
const invalidateCache = async (pattern) => {
  if (!isRedisReady()) return;
  const redis = getRedisClient();
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
};

module.exports = { redisCache, invalidateCache };
