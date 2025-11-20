const Spending = require("../models/Spending");
const mongoose = require("mongoose");

exports.getAccountSummary = async (req, res) => {
  try {
    // Guard against missing user
    if (!req.user || !req.user.id) {
      console.error("❌ req.user or req.user.id is missing");
      return res.status(401).json({ msg: "Authentication failed" });
    }

    const userId = req.user.id;
    console.log(`📊 Fetching account summary for user: ${userId}`);
    console.log(`📊 User Role: ${req.user.role}`);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌ Invalid ObjectId: ${userId}`);
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    // Debug: Check if any spending exists for this user
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const count = await Spending.countDocuments({ user: userObjectId });

    console.log(`📊 Found ${count} spending records for user ${userId}`);

    const summary = await Spending.aggregate([
      { $match: { user: userObjectId } },
      // Normalize type and guard amount
      {
        $project: {
          amount: { $ifNull: ["$amount", 0] },
          typeLower: { $toLower: "$type" },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$typeLower", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$typeLower", "expense"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    console.log("📊 Aggregation result:", JSON.stringify(summary));

    let income = 0;
    let expense = 0;

    if (summary.length > 0) {
      income = summary[0].totalIncome;
      expense = summary[0].totalExpense;
    }

    const balance = income - expense;

    res.json({
      income,
      expense,
      balance,
      debug: {
        userId,
        count,
        summaryRaw: summary,
      },
    });
  } catch (err) {
    console.error("❌ Account Summary Error:", err.message);
    console.error(err.stack);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
