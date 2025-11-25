// src/controllers/spendingController.js
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
      .lean()
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
      .sort({ date: -1 })
      .limit(limit)
      .lean()
      .exec();
    res.json({ success: true, spendings: docs });
  } catch (err) {
    console.error("getRecentSpendings error", err);
    res.status(500).json({ msg: "Server error" });
  }
};
