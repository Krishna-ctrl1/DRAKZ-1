const Blog = require("../models/blog.model");
const mongoose = require("mongoose");

// CREATE blog
exports.createBlog = async (req, res) => {
  const { title, content } = req.body;
  const author_id = req.user.id; // Changed from req.session.userId

  try {
    const blog = new Blog({
      title,
      content,
      author_id,
      likes: [],
      dislikes: [],
      comments: []
    });
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// GET all blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// LIKE blog
exports.likeBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Remove from dislikes if present
    blog.dislikes = blog.dislikes.filter(uid => uid.toString() !== userId);
    
    // Toggle like
    if (blog.likes.includes(userId)) {
      blog.likes = blog.likes.filter(uid => uid.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }
    
    await blog.save();
    res.json({ likes: blog.likes.length, dislikes: blog.dislikes.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to like blog" });
  }
};

// DISLIKE blog
exports.dislikeBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Remove from likes if present
    blog.likes = blog.likes.filter(uid => uid.toString() !== userId);
    
    // Toggle dislike
    if (blog.dislikes.includes(userId)) {
      blog.dislikes = blog.dislikes.filter(uid => uid.toString() !== userId);
    } else {
      blog.dislikes.push(userId);
    }
    
    await blog.save();
    res.json({ likes: blog.likes.length, dislikes: blog.dislikes.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to dislike blog" });
  }
};

// CHECK user interactions
exports.checkInteractions = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({
      hasLiked: blog.likes.includes(userId),
      hasDisliked: blog.dislikes.includes(userId)
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to check interactions" });
  }
};

// ADD comment
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = {
      user_id: userId,
      text,
      createdAt: new Date()
    };
    
    blog.comments.push(comment);
    await blog.save();
    
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// GET comments
exports.getComments = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id).populate('comments.user_id', 'name email');
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog.comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// DELETE comment
exports.deleteComment = async (req, res) => {
  const { id } = req.params; // Comment ID
  const userId = req.user.id;

  try {
    const blog = await Blog.findOne({ "comments._id": id });
    if (!blog) return res.status(404).json({ message: "Comment not found" });

    const comment = blog.comments.id(id);
    if (comment.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.remove();
    await blog.save();
    
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// DELETE blog
exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await blog.remove();
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog" });
  }
};
