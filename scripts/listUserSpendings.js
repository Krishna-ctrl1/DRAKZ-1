const mongoose = require("mongoose");
require("dotenv").config();
const Person = require("../src/models/people.model.js");
const Spending = require("../src/models/Spending");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Please set MONGO_URI in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // List all users with their IDs
  const users = await Person.find({ role: "user" });
  console.log("--- Users ---");
  for (const u of users) {
    const count = await Spending.countDocuments({ user: u._id });
    console.log(`User: ${u.email} | ID: ${u._id} | Spendings: ${count}`);
  }
  console.log("-------------");

  await mongoose.disconnect();
}

run().catch(console.error);
