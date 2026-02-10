const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // Optional image field
  
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, 
  status: { type: String, default: "pending" }, // 'pending', 'approved', 'rejected'
  
  // NEW: Stores why the admin rejected the blog
  rejection_reason: { type: String, default: "" }, 
  
  // MODERATION
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String, default: "" }, 

  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  published_at: Date,
  
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, 
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Blog", BlogSchema);