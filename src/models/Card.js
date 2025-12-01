// src/models/Card.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const CardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    holderName: { type: String, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    brand: { type: String, default: "Unknown" },
    last4: { type: String, required: true },
    masked: { type: String, required: true }, // e.g. '4556 **** **** 5168'
    encryptedNumber: { type: String }, // base64 AES-GCM ciphertext
    encryptedIv: { type: String }, // base64 IV
    encryptedTag: { type: String }, // base64 auth tag
    expiryMonth: { type: Number, required: true }, // 1-12
    expiryYear: { type: Number, required: true },
    colorTheme: { type: String, default: "#4fd4c6" },
    notes: { type: String },
  },
  { timestamps: true },
);

const Card = mongoose.models.Card || mongoose.model("Card", CardSchema);

module.exports = Card;
