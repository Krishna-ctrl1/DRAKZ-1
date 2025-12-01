// src/controllers/investments.controller.js
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
| 2. Get User Stocks (Your Stocks + Stock Chart)
|   For this project we ALWAYS return a fixed list with prices & changes.
|--------------------------------------------------------------------------
*/
exports.getUserStocks = async (req, res) => {
  try {
    const stocks = [
      {
        name: "Apple",
        symbol: "AAPL",
        current_price: 178.61,
        change_pct: "+1.5%",
      },
      {
        name: "Netflix",
        symbol: "NFLX",
        current_price: 416.03,
        change_pct: "+3.37%",
      },
      {
        name: "Meta",
        symbol: "META",
        current_price: 285.5,
        change_pct: "-0.44%",
      },
      {
        name: "Amazon",
        symbol: "AMZN",
        current_price: 316.02,
        change_pct: "+2.09%",
      },
    ];

    return res.json(stocks);
  } catch (err) {
    console.error("Error fetching user stocks:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| 3. Get User Loans (Your Loans)
|   If DB empty -> return dummy loans
|--------------------------------------------------------------------------
*/
exports.getUserLoans = async (req, res) => {
  try {
    let loans = await Loan.find({}).lean();

    if (!loans || loans.length === 0) {
      loans = [
        {
          type: "Home Loan",
          principal: 2000000,
          balance: 1450000,
          dateTaken: "2022-03-15",
          status: "ACTIVE",
          interestRate: 7.5,
          term: 10,
          emi: 23740,
          nextDue: "2024-12-10",
          totalPaid: 550000,
        },
        {
          type: "Car Loan",
          principal: 1000000,
          balance: 300000,
          dateTaken: "2021-01-10",
          status: "PAID",
          interestRate: 8.0,
          term: 5,
          emi: 18000,
          totalPaid: 700000,
        },
        {
          type: "Education Loan",
          principal: 800000,
          balance: 250000,
          dateTaken: "2020-07-05",
          status: "OVERDUE",
          interestRate: 6.8,
          term: 8,
          emi: 15500,
          nextDue: "2024-12-05",
          totalPaid: 550000,
        },
      ];
    }

    return res.json(loans);
  } catch (err) {
    console.error("Error fetching user loans:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| 4. Get Investment History (Total Investment graph)
|   If DB empty -> return dummy graph data
|--------------------------------------------------------------------------
*/
exports.getInvestmentHistory = async (req, res) => {
  try {
    const range = req.query.range || "6M";

    let monthsBack = 6;
    if (range === "1M") monthsBack = 1;
    if (range === "1Y") monthsBack = 12;

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - monthsBack);

    let data = await Transaction.aggregate([
      {
        $match: {
          category: "investment",
          date: { $gte: fromDate },
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
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    if (!data || data.length === 0) {
      const dummy = {
        "1M": [
          { name: "Week 1", value: 4800 },
          { name: "Week 2", value: 4950 },
          { name: "Week 3", value: 5100 },
          { name: "Week 4", value: 5250 },
        ],
        "6M": [
          { name: "Jun", value: 4200 },
          { name: "Jul", value: 4350 },
          { name: "Aug", value: 4430 },
          { name: "Sep", value: 4550 },
          { name: "Oct", value: 4730 },
          { name: "Nov", value: 4925 },
        ],
        "1Y": [
          { name: "Jan", value: 3980 },
          { name: "Feb", value: 4120 },
          { name: "Mar", value: 4300 },
          { name: "Apr", value: 4225 },
          { name: "May", value: 4400 },
          { name: "Jun", value: 4200 },
          { name: "Jul", value: 4350 },
          { name: "Aug", value: 4430 },
          { name: "Sep", value: 4550 },
          { name: "Oct", value: 4730 },
          { name: "Nov", value: 4925 },
          { name: "Dec", value: 5050 },
        ],
      };

      return res.json(dummy[range] || dummy["6M"]);
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
      const monthIndex = item._id.month - 1;
      return {
        name: monthNamesShort[monthIndex],
        value: item.total,
      };
    });

    return res.json(chartData);
  } catch (err) {
    console.error("Error building investment history:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
