const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author_type: String,
  author_id: Number,
  status: String,
  verified_by: Number,
  published_at: Date,
  created_at: Date
});

module.exports = mongoose.model("Blog", BlogSchema);
