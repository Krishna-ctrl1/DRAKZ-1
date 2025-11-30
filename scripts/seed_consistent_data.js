// scripts/seed_consistent_data.js
const path = require('path');
// 👇 THIS LINE FIXES THE "UNDEFINED" ERROR
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Person = require('../src/models/people.model');
const bcrypt = require('bcryptjs');

// Fallback if .env fails (Use local DB)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/drakz_db";

const seed = async () => {
  try {
    console.log('🔌 Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create a standard password hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt); 

    // 2. Define "Consistent" Users
    const users = [
      {
        name: "User 1",
        email: "user1@drakz.com",
        password: hash,
        role: "user",
        // These fields will now match your dashboard
        portfolioValue: 1250000, 
        riskProfile: "Aggressive",
        activeGoals: 3
      },
      {
        name: "User 2",
        email: "user2@drakz.com",
        password: hash,
        role: "user",
        portfolioValue: 450000,
        riskProfile: "Conservative",
        activeGoals: 1
      },
      {
        name: "User 3",
        email: "user3@drakz.com",
        password: hash,
        role: "user",
        portfolioValue: 875000,
        riskProfile: "Moderate",
        activeGoals: 2
      }
    ];

    // 3. Upsert Users (Update if exists, Create if not)
    for (const u of users) {
      await Person.findOneAndUpdate(
        { email: u.email }, 
        u, 
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`👤 Processed: ${u.name}`);
    }

    console.log('🎉 DONE: Database seeded with User 1, User 2, and User 3.');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seed();