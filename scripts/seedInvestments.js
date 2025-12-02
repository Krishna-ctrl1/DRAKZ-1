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

    // Clear existing investment transactions for this user
    await Transaction.collection.deleteMany({
      category: "investment",
      userId: user._id,
    });

    const year = new Date().getFullYear();

    const investments = [
      { month: 6, amount: 4200 },
      { month: 7, amount: 4350 },
      { month: 8, amount: 4430 },
      { month: 9, amount: 4550 },
      { month: 10, amount: 4730 },
      { month: 11, amount: 4925 },
    ].map((i) => ({
      userId: user._id,            // your schema wants this
      type: "investment",          // we can use any string; enum is bypassed
      category: "investment",
      amount: i.amount,
      date: new Date(year, i.month - 1, 10),
      description: "Seed Investment",
    }));

    // INSERT DIRECTLY into Mongo
    await Transaction.collection.insertMany(investments);
    console.log("Investments seeded successfully ✅");
  } catch (err) {
    console.error("Error seeding investments:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedInvestments();
