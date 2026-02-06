// routes/blog.route.js
const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management
 */

// 1. ADMIN ROUTES 
router.get("/admin/list", auth, blogCtrl.getAdminBlogs); 
router.patch("/admin/:id/status", auth, blogCtrl.updateBlogStatus);
router.delete("/admin/:id", auth, blogCtrl.deleteBlogByAdmin);

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created
 *   get:
 *     summary: Get public blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 */
// 2. USER ROUTES
router.post("/", auth, blogCtrl.createBlog); // Create

/**
 * @swagger
 * /blogs/my-blogs:
 *   get:
 *     summary: Get my blogs
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my blogs
 */
router.get("/my-blogs", auth, blogCtrl.getMyBlogs); // Get My Blogs

/**
 * @swagger
 * /blogs/update/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog updated
 */
router.put("/update/:id", auth, blogCtrl.updateBlogContent); // Edit & Resubmit

// 3. PUBLIC ROUTES
router.get("/", blogCtrl.getBlogs); // Public Feed

/**
 * @swagger
 * /blogs/{id}/like:
 *   post:
 *     summary: Like a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liked
 */
// 4. INTERACTION ROUTES
router.post("/:id/like", auth, blogCtrl.likeBlog);

/**
 * @swagger
 * /blogs/{id}/dislike:
 *   post:
 *     summary: Dislike a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disliked
 */
router.post("/:id/dislike", auth, blogCtrl.dislikeBlog);

/**
 * @swagger
 * /blogs/{id}/interactions:
 *   get:
 *     summary: Check interactions
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interactions status
 */
router.get("/:id/interactions", auth, blogCtrl.checkInteractions);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   post:
 *     summary: Add a comment
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *   get:
 *     summary: Get comments
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.post("/:id/comments", auth, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.getComments);

/**
 * @swagger
 * /blogs/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete("/comments/:id", auth, blogCtrl.deleteComment);

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 */
router.delete("/:id", auth, blogCtrl.deleteBlog);

module.exports = router;