const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");


router.post("/", auth, blogCtrl.createBlog);
router.get("/", blogCtrl.getBlogs);
router.post("/:id/like", auth, blogCtrl.likeBlog);
router.post("/:id/dislike", auth, blogCtrl.dislikeBlog);
router.get("/:id/interactions", auth, blogCtrl.checkInteractions);
router.post("/:id/comments", auth, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);
router.delete("/comments/:id", auth, blogCtrl.deleteComment);
router.delete("/:id", auth, blogCtrl.deleteBlog);

module.exports = router;
