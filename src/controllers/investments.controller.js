// src/controllers/investments.controller.js
const axios = require("axios");
const Loan = require("../models/loan.model");
const Transaction = require("../models/transaction.model");

exports.getStockApiKey = (req, res) => {
  return res.json({ apiKey: process.env.FINNHUB_API_KEY || "" });
};

exports.getRealTimeStock = async (req, res) => {
  try {
    const symbol = req.query.symbol; // e.g. ?symbol=AAPL

    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol is required" });
    }

    const API_KEY = process.env.FINNHUB_API_KEY;
    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: "FINNHUB_API_KEY missing in .env" });
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const response = await axios.get(url);
    const data = response.data || {};

    // Define conversion rate (approximate)
    const USD_TO_INR = 84.5;
    const convert = (val) => (val != null ? val * USD_TO_INR : null);

    return res.json({
      symbol,
      current_price: convert(data.c),
      high: convert(data.h),
      low: convert(data.l),
      open: convert(data.o),
      previous_close: convert(data.pc),
      volume: data.v ?? null,
      timestamp: data.t ?? null,
    });
  } catch (err) {
    console.error("Error fetching real-time stock:", err.message || err);
    return res
      .status(500)
      .json({ error: "Error fetching real-time stock data" });
  }
};

exports.getUserStocks = async (req, res) => {
  try {
    const API_KEY = process.env.FINNHUB_API_KEY;
    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: "FINNHUB_API_KEY missing in .env" });
    }

    // Only names & symbols are fixed – prices are fetched live
    const baseStocks = [
      { name: "Apple", symbol: "AAPL" },
      { name: "Netflix", symbol: "NFLX" },
      { name: "Meta", symbol: "META" },
      { name: "Amazon", symbol: "AMZN" },
    ];

    // Define conversion rate (approximate)
    // Since these are US stocks, Finnhub returns USD. We convert to INR.
    const USD_TO_INR = 84.5;

    const results = await Promise.all(
      baseStocks.map(async (stock) => {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`;
          const { data } = await axios.get(url);

          const curr = data?.c;
          const prev = data?.pc;
          let changePct = null;

          if (curr != null && prev != null && prev !== 0) {
            changePct = (((curr - prev) / prev) * 100).toFixed(2) + "%";
          }

          // Helper to convert USD -> INR
          const convert = (val) => (val != null ? val * USD_TO_INR : null);

          return {
            name: stock.name,
            symbol: stock.symbol,
            current_price: convert(curr), // Converted to INR
            change_pct: changePct,        // Percentage remains same
            high: convert(data?.h),
            low: convert(data?.l),
            open: convert(data?.o),
            previous_close: convert(prev),
            volume: data?.v ?? null,
            timestamp: data?.t ?? null,
          };
        } catch (err) {
          console.error(
            `Error fetching stock ${stock.symbol}:`,
            err.message || err
          );
          return {
            name: stock.name,
            symbol: stock.symbol,
            error: "Failed to fetch real-time data",
            current_price: null,
            change_pct: null,
          };
        }
      })
    );

    return res.json(results);
  } catch (err) {
    console.error("Error fetching user stocks:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({}).lean();
    // Just return whatever is in DB.
    // If nothing, frontend will see [] and can show "No loans".
    return res.json(loans || []);
  } catch (err) {
    console.error("Error fetching user loans:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/*
|--------------------------------------------------------------------------
| 4. Get Investment History (Total Investment graph)
|   1M  -> group by DAY (last 30 days)
|   6M  -> group by MONTH (last 6 months)
|   1Y  -> group by MONTH (last 12 months)
|--------------------------------------------------------------------------
*/
exports.getInvestmentHistory = async (req, res) => {
  try {
    const range = req.query.range || "6M";
    const now = new Date();

    let fromDate;
    let groupStage;
    let sortStage;

    if (range === "1M") {
      // Last 30 days, grouped by DAY
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 30);

      groupStage = {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        total: { $sum: "$amount" },
      };

      sortStage = {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      };
    } else {
      // 6M or 1Y -> group by MONTH
      const monthsBack = range === "1Y" ? 12 : 6;
      fromDate = new Date(now);
      fromDate.setMonth(fromDate.getMonth() - monthsBack);

      groupStage = {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        total: { $sum: "$amount" },
      };

      sortStage = {
        "_id.year": 1,
        "_id.month": 1,
      };
    }

    const data = await Transaction.aggregate([
      {
        $match: {
          category: "investment",
          date: { $gte: fromDate },
        },
      },
      { $group: groupStage },
      { $sort: sortStage },
    ]);

    if (!data || data.length === 0) {
      return res.json([]);
    }

    const monthNamesShort = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const chartData = data.map((item) => {
      if (range === "1M") {
        const { year, month, day } = item._id;
        const dateObj = new Date(year, month - 1, day);
        // show just date number on X-axis, e.g. "3", "14"
        const label = String(dateObj.getDate());
        return {
          name: label,
          value: item.total,
        };
      } else {
        const monthIndex = item._id.month - 1;
        return {
          name: monthNamesShort[monthIndex],
          value: item.total,
        };
      }
    });

    return res.json(chartData);
  } catch (err) {
    console.error("Error building investment history:", err);
    return res.status(500).json({ error: "Server error" });
  }
};