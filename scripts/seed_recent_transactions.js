const mongoose = require("mongoose");
require("dotenv").config();

const Person = require("../src/models/people.model");
const Transaction = require("../src/models/transaction.model");

const TYPES = ["Auto", "Health", "Life", "Home", "Insurance"];
const STATUSES = ["Completed", "Completed", "Completed", "Pending", "Pending"];
const DESCRIPTIONS = [
  "Monthly premium",
  "Policy renewal",
  "Coverage update",
  "Auto policy payment",
  "Health policy payment",
  "Life insurance payment",
  "Home insurance payment",
];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDateLast30Days = () => {
  const now = new Date();
  const daysAgo = getRandomInt(0, 29);
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  date.setHours(getRandomInt(8, 20), getRandomInt(0, 59), 0, 0);
  return date;
};

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Please set MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to DB");

  const users = await Person.find({ role: "user" }).select("_id").exec();
  console.log(`Found ${users.length} users`);

  let totalInserted = 0;

  for (const user of users) {
    const docs = [];
    for (let i = 0; i < 20; i++) {
      docs.push({
        userId: user._id,
        type: pick(TYPES),
        amount: getRandomInt(500, 50000),
        status: pick(STATUSES),
        description: pick(DESCRIPTIONS),
        date: randomDateLast30Days(),
      });
    }

    const result = await Transaction.insertMany(docs);
    totalInserted += result.length;
  }

  console.log(`Inserted ${totalInserted} transactions total`);
  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
