/**
 * Blog API Integration Tests
 * Tests: public listing, create, read, authorization
 */
const supertest = require("supertest");
const { createApp } = require("../setup");

let app;
let request;
let userToken = null;
let createdBlogId = null;

const TEST_USER = {
  name: "Blog Tester",
  email: `blogtester_${Date.now()}@drakz.test`,
  password: "Test@12345",
};

beforeAll(async () => {
  app = await createApp();
  request = supertest(app);

  // Register & login to get token
  const res = await request.post("/api/auth/register").send(TEST_USER);
  userToken = res.body.token;
});

describe("Blog API - /api/blogs", () => {
  // ─── Public Listing ─────────────────────────────────
  describe("GET /api/blogs", () => {
    it("should return blog list without auth", async () => {
      const res = await request.get("/api/blogs");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─── Create Blog ──────────────────────────────────────
  describe("POST /api/blogs", () => {
    it("should create a blog with valid token", async () => {
      const res = await request
        .post("/api/blogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Test Blog Post",
          content: "This is a test blog post created by automated testing.",
        });

      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(300);
      if (res.body._id) createdBlogId = res.body._id;
      if (res.body.blog && res.body.blog._id)
        createdBlogId = res.body.blog._id;
    });

    it("should reject blog creation without auth", async () => {
      const res = await request.post("/api/blogs").send({
        title: "Unauthorized Blog",
        content: "Should fail",
      });

      expect(res.status).toBe(401);
    });

    it("should reject blog creation with missing fields", async () => {
      const res = await request
        .post("/api/blogs")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "" });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ─── My Blogs ─────────────────────────────────────────
  describe("GET /api/blogs/my-blogs", () => {
    it("should return blogs owned by the user", async () => {
      const res = await request
        .get("/api/blogs/my-blogs")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should require auth", async () => {
      const res = await request.get("/api/blogs/my-blogs");
      expect(res.status).toBe(401);
    });
  });
});
