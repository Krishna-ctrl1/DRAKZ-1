// scripts/seedInvestments.js
require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("../src/models/transaction.model");
const Person = require("../src/models/people.model");

async function seedInvestments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await Person.findOne().lean();
    if (!user) throw new Error("No users found. Run scripts/seed.js first.");

    console.log("Seeding investment history for user:", user.email);

    // Clear old investment transactions for this user
    await Transaction.collection.deleteMany({
      category: "investment",
      userId: user._id,
    });

    const now = new Date();
    const year = now.getFullYear();

    // --- 12 months (for 1Y / 6M) ---
    const yearlyTemplate = [
      { month: 0, amount: 3980 }, // Jan
      { month: 1, amount: 44120 }, // Feb
      { month: 2, amount: 7300 }, // Mar
      { month: 3, amount: 4225 }, // Apr
      { month: 4, amount: 4400 }, // May
      { month: 5, amount: 27200 }, // Jun
      { month: 6, amount: 4350 }, // Jul
      { month: 7, amount: 9430 }, // Aug
      { month: 8, amount: 4550 }, // Sep
      { month: 9, amount: 4730 }, // Oct
      { month: 10, amount: 4925 }, // Nov
      { month: 11, amount: 55550 }, // Dec
    ];

    const yearlyDocs = yearlyTemplate.map((m) => ({
      userId: user._id,
      type: "investment", // enum is bypassed because we use collection.insertMany
      category: "investment",
      amount: m.amount,
      date: new Date(year, m.month, 10), // 10th of each month
      description: "Seed yearly investment",
    }));

    // --- Last 30 days (for 1M) ---
    const dailyDocs = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i); // today, yesterday, ...

      dailyDocs.push({
        userId: user._id,
        type: "investment",
        category: "investment",
        amount: 2000 + i * 20, // just incremental demo values
        date: d,
        description: "Seed daily investment",
      });
    }

    const allDocs = [...yearlyDocs, ...dailyDocs];

    await Transaction.collection.insertMany(allDocs);
    console.log("Investments seeded successfully ✅");
  } catch (err) {
    console.error("Error seeding investments:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedInvestments();
