// scripts/seedLoans.js
require("dotenv").config();
const mongoose = require("mongoose");
const Loan = require("../src/models/loan.model");
const Person = require("../src/models/people.model");

async function seedLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // pick any existing user (first one)
    const user = await Person.findOne().lean();
    if (!user) throw new Error("No users found. Run scripts/seed.js first.");

    console.log("Seeding loans for user:", user.email);

    // Clear existing loans for this user (using collection directly)
    await Loan.collection.deleteMany({ user_id: user._id });

    const loans = [
      {
        user_id: user._id,
        type: "Home Loan",
        principal: 2000000,
        balance: 1450000,
        dateTaken: new Date("2022-03-15"),
        status: "ACTIVE", // keep original text, we bypass enum
        interestRate: 7.5,
        term: 10,
        emi: 23740,
        nextDue: new Date("2024-12-10"),
        totalPaid: 550000,
      },
      {
        user_id: user._id,
        type: "Car Loan",
        principal: 1000000,
        balance: 300000,
        dateTaken: new Date("2021-01-10"),
        status: "PAID",
        interestRate: 8.0,
        term: 5,
        emi: 18000,
        totalPaid: 700000,
      },
      {
        user_id: user._id,
        type: "Education Loan",
        principal: 800000,
        balance: 250000,
        dateTaken: new Date("2020-07-05"),
        status: "OVERDUE",
        interestRate: 6.8,
        term: 8,
        emi: 15500,
        nextDue: new Date("2024-12-05"),
        totalPaid: 550000,
      },
    ];

    // INSERT DIRECTLY into Mongo (no Mongoose validation)
    await Loan.collection.insertMany(loans);
    console.log("Loans seeded successfully ✅");
  } catch (err) {
    console.error("Error seeding loans:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedLoans();
