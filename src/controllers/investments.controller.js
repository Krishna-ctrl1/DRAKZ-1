// src/controllers/investments.controller.js
const mongoose = require("mongoose");

// We don't need User here anymore for now, so you can remove it
// const User = require("../models/user.model");
const UserStock = require("../models/userStock.model");
const Loan = require("../models/loan.model");
const Transaction = require("../models/transaction.model");

/*
|--------------------------------------------------------------------------
| 1. Get Stock API Key
|--------------------------------------------------------------------------
*/
exports.getStockApiKey = (req, res) => {
  return res.json({ apiKey: process.env.ALPHA_VANTAGE_API_KEY || "" });
};

/*
|--------------------------------------------------------------------------
| 2. Get User Stocks  (For Your Stocks + Stock Table)
|   For now: return ALL stocks in DB (dummy data per project spec)
|--------------------------------------------------------------------------
*/
exports.getUserStocks = async (req, res) => {
  try {
    // ❌ OLD:
    // if (!req.session || !req.session.userId) { ... }

    // ✅ NEW: just fetch all stocks (or later filter by user)
    const stocks = await UserStock.find({}).lean();
    return res.json(stocks);
  } catch (err) {
    console.error("Error fetching user stocks:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

/*
|--------------------------------------------------------------------------
| 3. Get User Loans (For Your Loans section)
|   For now: return ALL loans in DB
|--------------------------------------------------------------------------
*/
exports.getUserLoans = async (req, res) => {
  try {
    // ❌ OLD session check removed

    const loans = await Loan.find({}).lean();
    return res.json(loans);
  } catch (err) {
    console.error("Error fetching user loans:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

/*
|--------------------------------------------------------------------------
| 4. Get Investment History (Graph data for Total Investment)
|   For now: aggregate ALL investment transactions (no user filter)
|   Output: [ { name: "Jan", value: 4500 }, ... ]
|--------------------------------------------------------------------------
*/
exports.getInvestmentHistory = async (req, res) => {
  try {
    // ❌ OLD: session + User + people_id
    const range = req.query.range || "6M";

    let monthsBack = 6;
    if (range === "1M") monthsBack = 1;
    if (range === "1Y") monthsBack = 12;

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - monthsBack);

    // Match all "investment" transactions from last N months
    const data = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: fromDate },
          category: "investment", // adjust if your field value differs
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNamesShort = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];

    const chartData = data.map((item) => {
      const monthIndex = item._id.month - 1;
      return {
        name: monthNamesShort[monthIndex],
        value: item.total,
      };
    });

    return res.json(chartData);
  } catch (err) {
    console.error("Error building investment history:", err);
    return res.status(500).json({ error: "Database error" });
  }
};
