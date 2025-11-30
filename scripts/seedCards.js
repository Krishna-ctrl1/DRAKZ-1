// scripts/seedCards.js
const mongoose = require("mongoose");
require("dotenv").config();
const Person = require("../src/models/people.model.js");
const Card = require("../src/models/Card");

// Generate truly unique card numbers based on user index
function generateCardNumber(userIndex, cardIndex) {
  // Create unique number: 4556 + userIndex (2 digits) + cardIndex (1 digit) + random (6 digits)
  const userPart = String(userIndex).padStart(2, "0");
  const cardPart = cardIndex;
  const randomPart = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0");
  return `4556${userPart}${cardPart}${randomPart}`;
}

// Generate unique last4 based on user index and card index
function generateLast4(userIndex, cardIndex) {
  // user 0 card 0: 0001, user 0 card 1: 0002, user 1 card 0: 0011, user 1 card 1: 0012, etc
  const uniqueId = userIndex * 10 + cardIndex + 1;
  return String(uniqueId).padStart(4, "0");
}

// Generate masked number
function generateMasked(last4) {
  return `**** **** **** ${last4}`;
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("Set MONGO_URI in .env");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("Connected to DB");

    // First, delete all existing cards to start fresh
    await Card.deleteMany({});
    console.log("Cleared existing cards");

    const users = await Person.find({ role: "user" }).limit(10);
    console.log(`Seeding cards for ${users.length} users\n`);

    const colorThemes = [
      "#6C5CE7",
      "#FF6B6B",
      "#4ECDC4",
      "#F39C12",
      "#3498DB",
      "#E74C3C",
    ];
    const brands = ["VISA", "MasterCard", "Amex", "Discover"];

    for (let userIdx = 0; userIdx < users.length; userIdx++) {
      const u = users[userIdx];
      const userColor = colorThemes[userIdx % colorThemes.length];
      const userBrand = brands[userIdx % brands.length];

      console.log(
        `\n📝 Seeding cards for user ${userIdx}: ${u.name || u.email}`,
      );

      // Seed credit card with UNIQUE details based on user index
      const creditLast4 = generateLast4(userIdx, 0);
      const creditMasked = generateMasked(creditLast4);
      try {
        const creditCard = await Card.create({
          user: u._id,
          holderName: u.name || `User ${userIdx + 1}`,
          type: "credit",
          brand: userBrand,
          last4: creditLast4,
          masked: creditMasked,
          expiryMonth: (userIdx % 12) + 1,
          expiryYear: 2027,
          colorTheme: userColor,
          notes: `Primary ${userBrand} credit card`,
        });
        console.log(
          `  ✓ Credit card created: ${userBrand} ending in ${creditLast4} (ID: ${creditCard._id})`,
        );
      } catch (err) {
        console.error(`  ✗ Credit card FAILED:`, err.message);
      }

      // Seed debit card with UNIQUE details based on user index
      const debitBrand = brands[(userIdx + 1) % brands.length];
      const debitLast4 = generateLast4(userIdx, 1);
      const debitMasked = generateMasked(debitLast4);
      try {
        const debitCard = await Card.create({
          user: u._id,
          holderName: u.name || `User ${userIdx + 1}`,
          type: "debit",
          brand: debitBrand,
          last4: debitLast4,
          masked: debitMasked,
          expiryMonth: ((userIdx + 6) % 12) + 1,
          expiryYear: 2026,
          colorTheme: colorThemes[(userIdx + 1) % colorThemes.length],
          notes: `Primary ${debitBrand} debit card`,
        });
        console.log(
          `  ✓ Debit card created:  ${debitBrand} ending in ${debitLast4} (ID: ${debitCard._id})`,
        );
      } catch (err) {
        console.error(`  ✗ Debit card FAILED:`, err.message);
      }
    }

    console.log("✅ Seeded cards successfully - all unique per user!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
