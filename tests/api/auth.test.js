/**
 * Auth API Integration Tests
 * Tests: register, login, /me, token validation, edge cases
 */
const supertest = require("supertest");
const { createApp } = require("../setup");

let app;
let request;
let testToken = null;
const TEST_USER = {
  name: "Test User",
  email: `testuser_${Date.now()}@drakz.test`,
  password: "Test@12345",
};

beforeAll(async () => {
  app = await createApp();
  request = supertest(app);
});

describe("Auth API - /api/auth", () => {
  // ─── Registration ─────────────────────────────────────
  describe("POST /api/auth/register", () => {
    it("should register a new user and return a token", async () => {
      const res = await request.post("/api/auth/register").send(TEST_USER);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(TEST_USER.email);
      expect(res.body.user.role).toBe("user");
      testToken = res.body.token;
    });

    it("should reject duplicate email registration", async () => {
      const res = await request.post("/api/auth/register").send(TEST_USER);

      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/already exists/i);
    });

    it("should reject registration without required fields", async () => {
      const res = await request
        .post("/api/auth/register")
        .send({ email: "incomplete@test.com" });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ─── Login ─────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request.post("/api/auth/login").send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(TEST_USER.email);
      testToken = res.body.token; // refresh token
    });

    it("should reject login with wrong password", async () => {
      const res = await request.post("/api/auth/login").send({
        email: TEST_USER.email,
        password: "WrongPassword123",
      });

      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/invalid credentials/i);
    });

    it("should reject login with non-existent email", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "nonexistent@drakz.test",
        password: "SomePassword",
      });

      expect(res.status).toBe(400);
    });
  });

  // ─── /me Endpoint ─────────────────────────────────────
  describe("GET /api/auth/me", () => {
    it("should return user profile with valid token", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", TEST_USER.email);
      expect(res.body).toHaveProperty("name", TEST_USER.name);
      expect(res.body).toHaveProperty("role", "user");
    });

    it("should reject request without token", async () => {
      const res = await request.get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("should reject request with invalid token", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken123");

      expect(res.status).toBe(401);
    });
  });

  // ─── Cleanup: delete test user ──────────────────────
  // (We don't delete because the user is needed for other tests)
});
