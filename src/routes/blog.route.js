// routes/blog.route.js
const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

// 1. CREATE (User submits blog)

// 2. PUBLIC LIST (Only shows approved blogs)

// 3. ADMIN ROUTES 
// This route fetches blogs based on status (?status=pending)
router.get("/admin/list", auth, blogCtrl.getAdminBlogs); 

// This route allows approving/rejecting
router.patch("/admin/:id/status", auth, blogCtrl.updateBlogStatus);

router.post("/", auth, blogCtrl.createBlog);
router.get("/", blogCtrl.getBlogs);
// ---------------------------------------------------------

// 4. OTHER ROUTES
router.post("/:id/like", auth, blogCtrl.likeBlog);
router.post("/:id/dislike", auth, blogCtrl.dislikeBlog);
router.get("/:id/interactions", auth, blogCtrl.checkInteractions);
router.post("/:id/comments", auth, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);
router.delete("/comments/:id", auth, blogCtrl.deleteComment);
router.delete("/:id", auth, blogCtrl.deleteBlog);

module.exports = router;