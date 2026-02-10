const Blog = require("../models/blog.model");
const Person = require("../models/people.model");

// CREATE
exports.createBlog = async (req, res) => {
  const { title, content, image } = req.body;
  const author_id = req.user.id; 

  try {
    const blog = new Blog({
      title,
      content,
      image,
      author_id,
      status: "pending",
      likes: [],
      dislikes: [],
      comments: []
    });
    await blog.save();
    res.json({ message: "Blog submitted! Awaiting admin approval.", blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// ADMIN: Get blogs (Fixed Populate for "Unknown" issue)
exports.getAdminBlogs = async (req, res) => {
  const { status, isFlagged } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (isFlagged === 'true') filter.isFlagged = true;

    const blogs = await Blog.find(filter)
      .populate('author_id', 'name email') // <--- FIXES "Unknown (ID Only)"
      .sort({ createdAt: -1 }); 
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin data" });
  }
};

// ADMIN: Toggle Flag (Moderation)
exports.toggleBlogFlag = async (req, res) => {
  const { id } = req.params;
  const { isFlagged, reason } = req.body;

  try {
    const updateData = { isFlagged };
    if (isFlagged) {
        updateData.flagReason = reason || "Flagged by Admin";
    } else {
        updateData.flagReason = "";
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Failed to update flag status" });
  }
};

// PUBLIC: Get Approved Blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "approved" })
      .populate('author_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// USER: Get My Blogs
exports.getMyBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch all blogs by this user, regardless of status
    const blogs = await Blog.find({ author_id: userId }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your blogs" });
  }
};

// USER: Edit & Resubmit (Resets status to Pending)
exports.updateBlogContent = async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  const userId = req.user.id;

  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only author can edit
    if (blog.author_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    if (image !== undefined) blog.image = image;

    // RESET STATUS
    blog.status = "pending";
    blog.rejection_reason = ""; // Clear previous rejection
    
    await blog.save();
    res.json({ message: "Blog updated and resubmitted!", blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to update blog" });
  }
};

// ADMIN: Approve or Reject (With Reason)
exports.updateBlogStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body; // Capture 'reason'
  const adminId = req.user.id;

  try {
    const updateData = {
      status,
      verified_by: adminId,
    };

    if (status === 'approved') {
      updateData.published_at = new Date();
      updateData.rejection_reason = "";
    } else if (status === 'rejected') {
      updateData.rejection_reason = reason || "No reason provided.";
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
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

exports.deleteBlogByAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Using findByIdAndDelete to remove it directly without author checks
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog permanently deleted by Admin" });
  } catch (err) {
    console.error("Admin delete error:", err);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};