// scripts/seedCreditScores.js
const mongoose = require("mongoose");
require("dotenv").config();
const Person = require("../src/models/people.model");
const CreditScore = require("../src/models/CreditScore");

async function seedCreditScores() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo for credit seeds");

    const persons = await Person.find({ role: "user" }).limit(50);
    for (const p of persons) {
      // skip if already exists
      const exists = await CreditScore.findOne({ user: p._id });
      if (exists) {
        console.log(`Credit score exists for ${p.email}`);
        continue;
      }
      const randomScore = Math.floor(300 + Math.random() * 550); // 300-850
      const cs = new CreditScore({
        user: p._id,
        score: randomScore,
        history: [{ score: randomScore, note: "initial seed" }],
      });
      await cs.save();
      console.log(`Seeded ${p.email} => ${randomScore}`);
    }

    console.log("Credit score seeding complete.");
  } catch (err) {
    console.error("seedCreditScores error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCreditScores();
