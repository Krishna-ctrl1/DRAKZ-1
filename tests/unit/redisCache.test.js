/**
 * Unit Tests for Redis Cache Middleware
 * Tests cache HIT / MISS / fallback behavior.
 */

// Mock Redis config
const mockGet = vi.fn();
const mockSetex = vi.fn().mockResolvedValue("OK");
const redisConfig = require("../../src/config/redis.config");
redisConfig.getRedisClient = () => ({
  get: mockGet,
  setex: mockSetex,
  keys: mockKeys,
  del: mockDel,
});
redisConfig.isRedisReady = () => true;

const { redisCache, invalidateCache } = require("../../src/middlewares/redisCache.middleware");


// Helper
function createMocks() {
  const req = {
    originalUrl: "/api/test",
    user: { _id: "user123" },
  };
  const jsonData = { data: "test data" };
  const res = {
    set: vi.fn(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next, jsonData };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Redis Cache Middleware", () => {
  it("should return cached data on HIT", async () => {
    const { req, res, next } = createMocks();
    const cachedData = { data: "cached" };
    mockGet.mockResolvedValueOnce(JSON.stringify(cachedData));

    const middleware = redisCache(60);
    await middleware(req, res, next);

    expect(res.set).toHaveBeenCalledWith("X-Cache", "HIT");
    expect(res.json).toHaveBeenCalledWith(cachedData);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() on cache MISS and intercept response", async () => {
    const { req, res, next } = createMocks();
    mockGet.mockResolvedValueOnce(null);

    const middleware = redisCache(60);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    // res.json is now wrapped — simulate controller calling it
    const responseData = { data: "fresh" };
    res.json(responseData);
    expect(mockSetex).toHaveBeenCalledWith(
      expect.any(String),
      60,
      JSON.stringify(responseData)
    );
  });

  it("should use custom key generator when provided", async () => {
    const { req, res, next } = createMocks();
    mockGet.mockResolvedValueOnce(null);

    const customKey = () => "custom-key";
    const middleware = redisCache(60, customKey);
    await middleware(req, res, next);

    expect(mockGet).toHaveBeenCalledWith("custom-key");
  });

  it("should fallback gracefully when Redis errors", async () => {
    const { req, res, next } = createMocks();
    mockGet.mockRejectedValueOnce(new Error("Connection refused"));

    const middleware = redisCache(60);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled(); // should continue without cache
  });
});

describe("Cache Invalidation", () => {
  it("should delete matching keys", async () => {
    mockKeys.mockResolvedValueOnce(["cache:key1", "cache:key2"]);
    mockDel.mockResolvedValueOnce(2);

    await invalidateCache("cache:*");

    expect(mockKeys).toHaveBeenCalledWith("cache:*");
    expect(mockDel).toHaveBeenCalledWith("cache:key1", "cache:key2");
  });

  it("should handle no matching keys gracefully", async () => {
    mockKeys.mockResolvedValueOnce([]);

    await invalidateCache("cache:nonexistent*");

    expect(mockDel).not.toHaveBeenCalled();
  });
});
