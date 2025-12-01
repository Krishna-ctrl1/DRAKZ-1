// models/blog.model.js
const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // ⚠️ CHANGED from Number to ObjectId so it accepts the Person's ID
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" }, 
  
  status: { type: String, default: "pending" }, 
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
  published_at: Date,
  
  // Add these if you want the interactions to work
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Person" }],
  comments: [{
    Person_id: { type: mongoose.Schema.Types.ObjectId, ref: "Person" },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("Blog", BlogSchema);