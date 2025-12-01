// models/userStock.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userStockSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: String,           // "Apple"
    symbol: String,         // "AAPL"
    quantity: Number,
    avg_buy_price: Number,
    current_price: Number,  // latest price
    change_pct: String,     // "+1.5%" (for quick UI)
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStock", userStockSchema);
