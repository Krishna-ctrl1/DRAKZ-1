#!/usr/bin/env node
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db.config.js");
const Spending = require("../src/models/Spending");

(async () => {
  try {
    const [, , fromArg, toArg, userIdArg] = process.argv;
    if (!fromArg || !toArg) {
      console.error(
        "Usage: node scripts/deleteSpendingsByDateRange.js <from YYYY-MM-DD> <to YYYY-MM-DD> [userId]",
      );
      process.exit(1);
    }

    const start = new Date(fromArg);
    const end = new Date(toArg);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format. Use YYYY-MM-DD.");
      process.exit(1);
    }
    // Inclusive end of day
    end.setHours(23, 59, 59, 999);

    await connectDB();

    const filter = { date: { $gte: start, $lte: end } };
    if (userIdArg) {
      filter.user = new mongoose.Types.ObjectId(userIdArg);
    }

    const result = await Spending.deleteMany(filter);
    console.log(
      `Deleted ${result.deletedCount} spending records between ${start.toISOString()} and ${end.toISOString()}${userIdArg ? " for user " + userIdArg : ""}.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Deletion script error:", err);
    process.exit(2);
  }
})();
