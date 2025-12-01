// models/loan.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // For "Your Loans" card
    type: String,             // "Home Loan"
    principal: Number,        // loan_amount
    balance: Number,          // remaining_amount
    dateTaken: String,        // "March 15, 2022" (store string for display)
    status: {                 // "Active" / "Paid" / "Overdue"
      type: String,
      enum: ["Active", "Paid", "Overdue"],
      default: "Active",
    },

    interestRate: Number,     // 7.5
    term: Number,             // in years
    emi: Number,              // monthly EMI
    nextDue: String,          // "November 28, 2025"
    totalPaid: Number,        // total paid so far
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
