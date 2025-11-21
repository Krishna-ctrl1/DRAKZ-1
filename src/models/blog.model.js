const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    author_type: {
      type: String,
      enum: ["user", "advisor", "admin"],
      default: "user",
    },

    // 🔥 author_id MUST be ObjectId, NOT Number
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      default: "pending",
    },

    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    published_at: {
      type: Date,
      default: Date.now,
    },

    // 🔥 REQUIRED FOR YOUR LIKE/DISLIKE LOGIC
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    comments: [CommentSchema],
  },

  { timestamps: true }  // 🔥 automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Blog", BlogSchema);
