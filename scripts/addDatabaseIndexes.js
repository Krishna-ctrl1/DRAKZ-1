// scripts/addDatabaseIndexes.js
const mongoose = require("mongoose");
require("dotenv").config();

async function addIndexes() {
  if (!process.env.MONGO_URI) {
    console.error("Please set MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db;

  try {
    // Spendings indexes - these queries are slow
    console.log("\n📊 Creating Spendings indexes...");
    await db.collection("spendings").createIndex({ user: 1, date: -1 });
    console.log("  ✓ user + date (desc)");

    await db.collection("spendings").createIndex({ user: 1, type: 1 });
    console.log("  ✓ user + type");

    await db.collection("spendings").createIndex({ user: 1, date: 1, type: 1 });
    console.log("  ✓ user + date + type (compound)");

    // Cards indexes
    console.log("\n💳 Creating Cards indexes...");
    await db.collection("cards").createIndex({ user: 1, createdAt: -1 });
    console.log("  ✓ user + createdAt (desc)");

    // CreditScore indexes
    console.log("\n📈 Creating CreditScore indexes...");
    await db
      .collection("creditscores")
      .createIndex({ user: 1 }, { unique: true });
    console.log("  ✓ user (unique)");

    // People indexes (if not already exist)
    console.log("\n👤 Creating People indexes...");
    await db.collection("people").createIndex({ email: 1 }, { unique: true });
    console.log("  ✓ email (unique)");

    await db.collection("people").createIndex({ role: 1 });
    console.log("  ✓ role");

    console.log("\n✅ All indexes created successfully!");
    console.log("\nℹ️  Query performance should be significantly faster now.");
  } catch (err) {
    if (err.code === 11000 || err.message.includes("already exists")) {
      console.log("ℹ️  Some indexes already exist - that's okay!");
    } else {
      console.error("❌ Error creating indexes:", err.message);
    }
  }

  await mongoose.disconnect();
  console.log("\n✅ Disconnected from MongoDB");
}

addIndexes().catch(console.error);
