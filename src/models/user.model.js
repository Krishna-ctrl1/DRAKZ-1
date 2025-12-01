// src/models/user.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Whatever you’re already storing from auth
    password_hash: {
      type: String,
      required: true,
    },

    // Link to people collection (PAN-linked profile)
    // ref name doesn't really matter unless you populate
    people_id: {
      type: Schema.Types.ObjectId,
      ref: "People", // or "Person" – matches your people.model export name
      default: null,
    },

    role: {
      type: String,
      enum: ["normal", "premium", "admin"],
      default: "normal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
