/**
 * Unit Tests for Auth Middleware
 * Tests the auth, requireRole, requireAdmin middleware functions in isolation.
 */
const jwt = require("jsonwebtoken");

// Manually inject mock process env for jwt config instead of module mock since CJS module caching ignores vi.mock here
process.env.JWT_SECRET = "test-secret-key";

const {
  auth,
  requireRole,
  requireAdmin,
} = require("../../src/middlewares/auth.middleware.js");

// Helper: create mock req/res/next
function createMocks(overrides = {}) {
  const req = {
    header: vi.fn(),
    path: "/test",
    user: null,
    ...overrides,
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe("Auth Middleware - auth()", () => {
  it("should call next() with a valid Bearer token", () => {
    const token = jwt.sign({ id: "user123", role: "user" }, "test-secret-key");
    const { req, res, next } = createMocks();
    req.header.mockImplementation((name) => {
      if (name === "Authorization") return `Bearer ${token}`;
      return undefined;
    });

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user123");
    expect(req.user.role).toBe("user");
  });

  it("should call next() with x-auth-token header", () => {
    const token = jwt.sign({ id: "user456", role: "admin" }, "test-secret-key");
    const { req, res, next } = createMocks();
    req.header.mockImplementation((name) => {
      if (name === "x-auth-token") return token;
      return undefined;
    });

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("user456");
  });

  it("should return 401 if no token is provided", () => {
    const { req, res, next } = createMocks();
    req.header.mockReturnValue(undefined);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ msg: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    const { req, res, next } = createMocks();
    req.header.mockImplementation((name) => {
      if (name === "Authorization") return "Bearer invalid-token";
      return undefined;
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is expired", () => {
    const token = jwt.sign(
      { id: "user123", role: "user" },
      "test-secret-key",
      { expiresIn: "0s" }
    );
    const { req, res, next } = createMocks();
    req.header.mockImplementation((name) => {
      if (name === "Authorization") return `Bearer ${token}`;
      return undefined;
    });

    // Small delay to ensure expiry
    setTimeout(() => {
      auth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    }, 10);
  });
});

describe("Auth Middleware - requireRole()", () => {
  it("should allow user with matching role", () => {
    const { req, res, next } = createMocks();
    req.user = { id: "user1", role: "admin" };

    requireRole(["admin"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should allow user if role is in allowed list", () => {
    const { req, res, next } = createMocks();
    req.user = { id: "user1", role: "advisor" };

    requireRole(["admin", "advisor"])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should deny user with non-matching role", () => {
    const { req, res, next } = createMocks();
    req.user = { id: "user1", role: "user" };

    requireRole(["admin"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("Auth Middleware - requireAdmin()", () => {
  it("should allow admin users", () => {
    const { req, res, next } = createMocks();
    req.user = { id: "admin1", role: "admin" };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should deny non-admin users", () => {
    const { req, res, next } = createMocks();
    req.user = { id: "user1", role: "user" };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
