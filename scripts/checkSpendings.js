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

  const email = "user5@drakz.com";
  const user = await Person.findOne({ email });

  if (!user) {
    console.log(`User ${email} not found`);
    process.exit(0);
  }

  console.log(`User found: ${user._id}`);

  const spendings = await Spending.find({ user: user._id });
  console.log(`Found ${spendings.length} spendings for user`);

  if (spendings.length > 0) {
    console.log("Sample spending:", spendings[0]);

    // Run aggregation manually
    const summary = await Spending.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
    ]);
    console.log("Aggregation result:", summary);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
