const Blog = require("../models/blog.model");
const mongoose = require("mongoose");

// CREATE blog
exports.createBlog = async (req, res) => {
  const { title, content } = req.body;
  const author_id = req.session.userId;

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
