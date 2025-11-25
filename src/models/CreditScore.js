const mongoose = require("mongoose");

const CreditHistorySchema = new mongoose.Schema({
  score: { type: Number, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
});

const CreditScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
    unique: true,
  },
  score: { type: Number, required: true, min: 0, max: 850 },
  lastUpdated: { type: Date, default: Date.now },
  history: { type: [CreditHistorySchema], default: [] },
});

module.exports = mongoose.model("CreditScore", CreditScoreSchema);
