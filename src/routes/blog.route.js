// routes/blog.route.js
const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

// 1. ADMIN ROUTES 
router.get("/admin/list", auth, blogCtrl.getAdminBlogs); 
router.patch("/admin/:id/status", auth, blogCtrl.updateBlogStatus);
router.delete("/admin/:id", auth, blogCtrl.deleteBlogByAdmin);

// 2. USER ROUTES
router.post("/", auth, blogCtrl.createBlog); // Create
router.get("/my-blogs", auth, blogCtrl.getMyBlogs); // Get My Blogs
router.put("/update/:id", auth, blogCtrl.updateBlogContent); // Edit & Resubmit

// 3. PUBLIC ROUTES
router.get("/", blogCtrl.getBlogs); // Public Feed

// 4. INTERACTION ROUTES
router.post("/:id/like", auth, blogCtrl.likeBlog);
router.post("/:id/dislike", auth, blogCtrl.dislikeBlog);
router.get("/:id/interactions", auth, blogCtrl.checkInteractions);
router.post("/:id/comments", auth, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);
router.delete("/comments/:id", auth, blogCtrl.deleteComment);
router.delete("/:id", auth, blogCtrl.deleteBlog);

module.exports = router;