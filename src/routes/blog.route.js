const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

// Create blog (protected)
router.post("/", auth, blogCtrl.createBlog);

// Public: list blogs
router.get("/", blogCtrl.getBlogs);

// Interactions & comments (protected where needed)
router.post("/:id/like", auth, blogCtrl.likeBlog);
router.post("/:id/dislike", auth, blogCtrl.dislikeBlog);
router.get("/:id/interactions", auth, blogCtrl.checkInteractions);

// Comments
router.post("/:id/comments", auth, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);
router.delete("/comments/:id", auth, blogCtrl.deleteComment);

// Delete blog (protected)
router.delete("/:id", auth, blogCtrl.deleteBlog);

module.exports = router;
