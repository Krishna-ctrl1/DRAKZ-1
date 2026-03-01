const mongoose = require("mongoose");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const Person = require("../src/models/people.model.js");
    const Transaction = require("../src/models/transaction.model.js");

    // Get up to 5 users
    const users = await Person.find({ role: 'user' }).limit(5);
    console.log(`Found ${users.length} users to seed.`);

    let insertedCount = 0;

    for (const user of users) {
      // Delete existing Investment transactions for a clean slate
      await Transaction.deleteMany({ userId: user._id, type: 'Investment' });

      const transactionsToInsert = [];
      const now = new Date();

      // Generate daily investments for the past 365 days
      for (let i = 365; i >= 0; i -= Math.floor(Math.random() * 3) + 1) { // Random interval 1-3 days
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        // Random amount between 100 and 1000, slightly trending up over time
        const baseAmount = 100 + (365 - i) * 1.5;
        const amount = Number((baseAmount + Math.random() * 200).toFixed(2));

        transactionsToInsert.push({
          userId: user._id,
          type: 'Investment',
          amount: amount,
          status: 'Completed',
          description: 'Automated Portfolio Deposit',
          date: date
        });
      }

      await Transaction.insertMany(transactionsToInsert);
      insertedCount += transactionsToInsert.length;
      console.log(`Seeded ${transactionsToInsert.length} investments for user: ${user.name}`);
    }

    console.log(`Successfully inserted ${insertedCount} total investment transactions!`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    process.exit(0);
  }
}

seed();
