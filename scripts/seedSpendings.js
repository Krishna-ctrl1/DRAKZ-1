// scripts/seedSpendings.js
const mongoose = require("mongoose");
require("dotenv").config();

// adjust these paths if your project uses different filenames
const Person = require("../src/models/people.model.js");
const Spending = require("../src/models/Spending");

function randBetween(a, b) {
  return Math.floor(a + Math.random() * (b - a + 1));
}

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

  // --- FILTER: only users (change role value if your user role field is named differently) ---
  // If your people model uses `role` field with values like 'admin','user','advisor'
  const persons = await Person.find({ role: "user" }).limit(100).exec();

  console.log(`Seeding for ${persons.length} users`);

  const categoriesExpense = [
    "Groceries",
    "Transport",
    "Bills",
    "Shopping",
    "Dining",
    "Entertainment",
  ];
  const categoriesIncome = ["Salary", "Refund", "Transfer", "Gift"];

  const weeks = 6;
  const now = new Date();
  const monday = (d) => {
    const dt = new Date(d);
    const diff = (dt.getDay() + 6) % 7;
    dt.setDate(dt.getDate() - diff);
    dt.setHours(10, 0, 0, 0);
    return dt;
  };

  for (const p of persons) {
    for (let w = 0; w < weeks; w++) {
      const weekStart = monday(now);
      weekStart.setDate(weekStart.getDate() - (weeks - 1 - w) * 7);

      const txCount = randBetween(4, 10);
      for (let t = 0; t < txCount; t++) {
        const dayOffset = randBetween(0, 6);
        const dt = new Date(weekStart);
        dt.setDate(dt.getDate() + dayOffset);
        dt.setHours(randBetween(8, 22), randBetween(0, 59), 0, 0);

        const isIncome = Math.random() < 0.18;
        if (isIncome) {
          const amount = randBetween(200, 3000);
          await Spending.create({
            user: p._id,
            amount,
            type: "income",
            category:
              categoriesIncome[randBetween(0, categoriesIncome.length - 1)],
            description: "Seeded income",
            date: dt,
          });
        } else {
          const amount = randBetween(20, 650);
          await Spending.create({
            user: p._id,
            amount,
            type: "expense",
            category:
              categoriesExpense[randBetween(0, categoriesExpense.length - 1)],
            description: "Seeded expense",
            date: dt,
          });
        }
      }
    }
    console.log(`Seeded spendings for user ${p.email || p._id}`);
  }

  console.log("Done seeding spendings");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
