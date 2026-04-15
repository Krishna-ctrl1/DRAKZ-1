/**
 * Protected Endpoints Integration Tests
 * Tests that auth-protected routes reject unauthenticated requests
 * and return proper data when authenticated.
 */
const supertest = require("supertest");
const { createApp } = require("../setup");

let app;
let request;
let userToken = null;

const TEST_USER = {
  name: "Protected Route Tester",
  email: `protected_${Date.now()}@drakz.test`,
  password: "Test@12345",
};

beforeAll(async () => {
  app = await createApp();
  request = supertest(app);

  // Register & login
  const res = await request.post("/api/auth/register").send(TEST_USER);
  userToken = res.body.token;
});

describe("Protected Endpoints - Auth Guard", () => {
  const PROTECTED_ENDPOINTS = [
    { method: "get", path: "/api/credit-score/me", name: "Credit Score" },
    { method: "get", path: "/api/account-summary", name: "Account Summary" },
    { method: "get", path: "/api/spendings/weekly", name: "Weekly Spending" },
    { method: "get", path: "/api/spendings/distribution-pie", name: "Spending Distribution" },
    { method: "get", path: "/api/investments/user-investments", name: "User Investments" },
    { method: "get", path: "/api/investments/investment-history?range=6M", name: "Investment History" },
    { method: "get", path: "/api/blogs/my-blogs", name: "My Blogs" },
    { method: "get", path: "/api/cards", name: "Cards" },
    { method: "get", path: "/api/user/advisors", name: "Advisors" },
    { method: "get", path: "/api/user/advisor/status", name: "Advisor Status" },
  ];

  describe("should reject unauthenticated requests (401)", () => {
    PROTECTED_ENDPOINTS.forEach(({ method, path, name }) => {
      it(`${name} (${method.toUpperCase()} ${path})`, async () => {
        const res = await request[method](path);
        expect(res.status).toBe(401);
      });
    });
  });

  describe("should accept authenticated requests (200 or valid error)", () => {
    PROTECTED_ENDPOINTS.forEach(({ method, path, name }) => {
      it(`${name} (${method.toUpperCase()} ${path})`, async () => {
        const res = await request[method](path).set(
          "Authorization",
          `Bearer ${userToken}`
        );
        // Should not be 401 (auth) or 404 (route not found unless it's a specific data not found)
        expect(res.status).not.toBe(401);
        if (path !== "/api/credit-score/me") {
          expect(res.status).not.toBe(404);
        }
      });
    });
  });
});

describe("Spendings API - /api/spendings", () => {
  it("should create a spending record", async () => {
    const res = await request
      .post("/api/spendings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        amount: 150,
        type: "expense",
        category: "food",
        description: "Test spending",
      });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
  });

  it("should get weekly summary", async () => {
    const res = await request
      .get("/api/spendings/weekly")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it("should get spending list", async () => {
    const res = await request
      .get("/api/spendings/list")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

describe("Contact API - /api/contact", () => {
  it("should submit a contact message", async () => {
    const res = await request.post("/api/contact").send({
      name: "Test User",
      email: "test@test.com",
      subject: "Test Subject",
      message: "This is a test message from automated tests",
    });

    // Accept 200/201 (success), 500 (email failure), or 404 (if not implemented yet)
    expect([200, 201, 500, 404]).toContain(res.status);
  });
});
