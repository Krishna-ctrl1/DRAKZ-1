// src/controllers/investments.controller.js
const axios = require("axios");
const Loan = require("../models/loan.model");
const Transaction = require("../models/transaction.model");

// Cache for stock prices to avoid rate limiting (cache for 30 minutes)
const stockCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Fallback prices in USD (approximate current values)
const FALLBACK_PRICES = {
  AAPL: { price: 225, change: 1.2 },
  NFLX: { price: 680, change: -0.5 },
  META: { price: 485, change: 2.1 },
  AMZN: { price: 185, change: 0.8 }
};

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
    const USD_TO_INR = 84.5;

    // Fetch stocks sequentially to avoid rate limiting
    const results = [];
    
    for (const stock of baseStocks) {
      try {
        // Check cache first
        const cacheKey = stock.symbol;
        const cachedData = stockCache.get(cacheKey);
        
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
          console.log(`✓ Using cached data for ${stock.symbol} (age: ${Math.round((Date.now() - cachedData.timestamp) / 1000)}s)`);
          results.push(cachedData.data);
          continue;
        }

        // Fetch from API with delay to avoid rate limiting
        console.log(`Fetching fresh data for ${stock.symbol}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between requests
        
        const url = `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`;
        const { data } = await axios.get(url, { timeout: 10000 });

        const curr = data?.c;
        const prev = data?.pc;
        let changePct = null;

        if (curr != null && prev != null && prev !== 0) {
          changePct = (((curr - prev) / prev) * 100).toFixed(2) + "%";
        }

        // Helper to convert USD -> INR
        const convert = (val) => (val != null ? val * USD_TO_INR : null);

        const result = {
          name: stock.name,
          symbol: stock.symbol,
          current_price: convert(curr),
          change_pct: changePct,
          high: convert(data?.h),
          low: convert(data?.l),
          open: convert(data?.o),
          previous_close: convert(prev),
          volume: data?.v ?? null,
          timestamp: data?.t ?? null,
        };
        
        // Cache the result
        stockCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        console.log(`✓ Cached fresh data for ${stock.symbol}`);
        results.push(result);
      } catch (err) {
        const errorDetails = err.response?.status 
          ? `HTTP ${err.response.status}` 
          : err.code 
          ? `${err.code}` 
          : err.message || 'Unknown error';
        
        console.error(
          `Error fetching stock ${stock.symbol}: ${errorDetails}`
        );
        
        // Try to use cached data even if expired
        const cachedData = stockCache.get(stock.symbol);
        if (cachedData) {
          console.log(`⚠ Using stale cache for ${stock.symbol} due to error`);
          results.push(cachedData.data);
        } else {
          // Use fallback prices if no cache available
          console.log(`⚠ Using fallback price for ${stock.symbol}`);
          const fallback = FALLBACK_PRICES[stock.symbol];
          const convert = (val) => (val != null ? val * USD_TO_INR : null);
          
          results.push({
            name: stock.name,
            symbol: stock.symbol,
            current_price: convert(fallback?.price || 100),
            change_pct: `${fallback?.change || 0}%`,
            high: convert(fallback?.price ? fallback.price * 1.02 : null),
            low: convert(fallback?.price ? fallback.price * 0.98 : null),
            open: convert(fallback?.price || null),
            previous_close: convert(fallback?.price || null),
            volume: null,
            timestamp: Math.floor(Date.now() / 1000),
            isFallback: true
          });
        }
      }
    }

    return res.json(results);
  } catch (err) {
    console.error("Error fetching user stocks:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.getUserLoans = async (req, res) => {
  try {
    // Filter loans by the logged-in user's ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const loans = await Loan.find({ user_id: userId }).lean();
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
    // Filter by the logged-in user's ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
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
          userId: userId,
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