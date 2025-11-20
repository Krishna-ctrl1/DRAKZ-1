const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const isUserAuthenticated = require("../middlewares/authCheck.js");


router.post("/", isUserAuthenticated, blogCtrl.createBlog);
router.get("/", blogCtrl.getBlogs);
router.post("/:id/like", isUserAuthenticated, blogCtrl.likeBlog);
router.post("/:id/dislike", isUserAuthenticated, blogCtrl.dislikeBlog);
router.get("/:id/interactions", isUserAuthenticated, blogCtrl.checkInteractions);
router.post("/:id/comments", isUserAuthenticated, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);
router.delete("/comments/:id", isUserAuthenticated, blogCtrl.deleteComment);
router.delete("/:id", isUserAuthenticated, blogCtrl.deleteBlog);

module.exports = router;
