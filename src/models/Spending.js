// src/models/Spending.js
const mongoose = require("mongoose");

const SpendingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    amount: { type: Number, required: true }, // positive number
    type: { type: String, enum: ["expense", "income"], required: true },
    category: { type: String, default: "general" },
    description: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Spending", SpendingSchema);
