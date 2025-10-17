// src/controllers/spendingController.js
const mongoose = require("mongoose");
const Spending = require("../models/Spending");
const Person = require("../models/people.model");

/**
 * Helper: get Monday (start) of a week for a given date (local)
 */
function startOfWeek(d) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // 0 => Mon
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - diff);
  return dt;
}

/**
 * GET /api/spendings/weekly?weeks=5
 * returns an array of week buckets: [{ weekStart, weekEnd, income, expense, totalsByDay(optional) }, ...]
 * Default weeks = 5 (current week + previous weeks-1)
 */
exports.getWeeklySummary = async (req, res) => {
  try {
    const tokenUser = req.user; // auth middleware should set req.user
    if (!tokenUser) return res.status(401).json({ msg: "Unauthorized" });

    const userId = req.user.id || req.user._id || req.user.userId;
    const weeks = Math.max(
      1,
      Math.min(12, parseInt(req.query.weeks || "5", 10)),
    );

    // compute start date = start of (weeks-1) weeks ago (so includes current week)
    const now = new Date();
    const startNewestWeek = startOfWeek(now); // this week's Monday
    const earliest = new Date(startNewestWeek);
    earliest.setDate(earliest.getDate() - (weeks - 1) * 7);
    earliest.setHours(0, 0, 0, 0);

    // fetch all spendings for user >= earliest
    const docs = await Spending.find({
      user: userId,
      date: { $gte: earliest },
    })
      .select("amount type date category -_id")
      .lean()
      .sort({ date: 1 })
      .exec();

    // build buckets: an array of weeks from earliest -> current
    const buckets = [];
    for (let i = 0; i < weeks; i++) {
      const start = new Date(earliest);
      start.setDate(start.getDate() + i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7); // exclusive end
      buckets.push({
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        income: 0,
        expense: 0,
        daily: [0, 0, 0, 0, 0, 0, 0], // optional per-day totals (Mon->Sun)
      });
    }

    // assign docs to buckets
    docs.forEach((doc) => {
      const d = new Date(doc.date);
      // find bucket index
      const index = Math.floor(
        (startOfWeek(d) - earliest) / (7 * 24 * 3600 * 1000),
      );
      if (index >= 0 && index < buckets.length) {
        if (doc.type === "income") buckets[index].income += doc.amount;
        else buckets[index].expense += doc.amount;
        // compute day index (Mon=0..Sun=6)
        const dayIndex = (d.getDay() + 6) % 7;
        buckets[index].daily[dayIndex] +=
          doc.amount * (doc.type === "expense" ? -1 : 1);
      }
    });

    // format response reversed so latest week last or first? We'll return earliest->latest
    res.json({ success: true, weeks: buckets });
  } catch (err) {
    console.error("getWeeklySummary error", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * POST /api/spendings
 * create a spending record: body { amount, type, category, description, date (optional) }
 */
exports.createSpending = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const { amount, type, category, description, date } = req.body;
    if (!amount || !type)
      return res.status(400).json({ msg: "amount and type required" });
    if (!["expense", "income"].includes(type))
      return res.status(400).json({ msg: "invalid type" });

    const s = await Spending.create({
      user: userId,
      amount: Number(amount),
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({ success: true, spending: s });
  } catch (err) {
    console.error("createSpending error", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/spendings/list?limit=50
 * Get recent spendings for user (for details list)
 */
exports.getRecentSpendings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const limit = Math.min(200, parseInt(req.query.limit || "50", 10));
    const docs = await Spending.find({ user: userId })
      .select("amount type date category description")
      .sort({ date: -1 })
      .limit(lim)
      .lean()
      .exec();
    res.json({ success: true, spendings: docs });
  } catch (err) {
    console.error("getRecentSpendings error", err);
    res.status(500).json({ msg: "Server error" });
  }
};

/**
 * GET /api/spendings/distribution-pie?days=30
 * Aggregates expense spendings by category for the past N days (default 30).
 * Returns category breakdown with amounts, percentages, and colors for pie chart.
 */
exports.getExpenseDistributionPie = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const days = Math.max(
      1,
      Math.min(365, parseInt(req.query.days || "30", 10)),
    );
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - days);

    const userObjectId =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    // Aggregate expenses by category
    const distribution = await Spending.aggregate([
      {
        $match: {
          user: userObjectId,
          type: "expense",
          date: { $gte: since },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])
      .allowDiskUse(true)
      .exec();

    const total = distribution.reduce((sum, item) => sum + item.total, 0);

    // Define colors for each category
    const categoryColors = {
      "Shopping and Entertainment": "#7C3AED",
      "Groceries and Utilities": "#F97316",
      "Transportation and Health": "#38BDF8",
      "Dining and Takeout": "#10B981",
      "Travel and Experiences": "#F472B6",
      "Bills and Subscriptions": "#FACC15",
      Entertainment: "#8B5CF6",
      Shopping: "#EC4899",
      Transport: "#06B6D4",
      Groceries: "#84CC16",
      Dining: "#F43F5E",
      Other: "#6B7280",
    };

    const categories = distribution.map((item) => {
      const color = categoryColors[item._id] || categoryColors["Other"];
      return {
        category: item._id || "Other",
        amount: Number(item.total.toFixed(2)),
        percentage:
          total > 0 ? Number(((item.total / total) * 100).toFixed(1)) : 0,
        count: item.count,
        color,
      };
    });

    res.json({
      success: true,
      total: Number(total.toFixed(2)),
      days,
      categories,
      summary: {
        topCategory: categories[0]?.category || "N/A",
        topAmount: categories[0]?.amount || 0,
        averagePerTransaction:
          total > 0
            ? Number(
                (
                  total /
                  distribution.reduce((sum, item) => sum + item.count, 0)
                ).toFixed(2),
              )
            : 0,
      },
    });
  } catch (err) {
    console.error("getExpenseDistributionPie error", err);
    res.status(500).json({ msg: "Server error" });
  }
};
