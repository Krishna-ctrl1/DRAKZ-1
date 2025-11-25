// scripts/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Person = require("../src/models/people.model");
require("dotenv").config();

const users = [
  {
    email: "admin1@drakz.com",
    password: "Admin1@123",
    role: "admin",
    name: "Admin 1",
  },
  {
    email: "admin2@drakz.com",
    password: "Admin2@123",
    role: "admin",
    name: "Admin 2",
  },
  {
    email: "advisor1@drakz.com",
    password: "Advisor1@123",
    role: "advisor",
    name: "Advisor 1",
  },
  {
    email: "advisor2@drakz.com",
    password: "Advisor2@123",
    role: "advisor",
    name: "Advisor 2",
  },
  {
    email: "user1@drakz.com",
    password: "User1@123",
    role: "user",
    name: "User 1",
  },
  {
    email: "user2@drakz.com",
    password: "User2@123",
    role: "user",
    name: "User 2",
  },
  {
    email: "user3@drakz.com",
    password: "User3@123",
    role: "user",
    name: "User 3",
  },
  {
    email: "user4@drakz.com",
    password: "User4@123",
    role: "user",
    name: "User 4",
  },
  {
    email: "user5@drakz.com",
    password: "User5@123",
    role: "user",
    name: "User 5",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing documents
    await Person.deleteMany({});
    console.log("Cleared existing Person documents");

    // Hash passwords and prepare documents
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    );

    // Direct batch insert into DB
    await Person.insertMany(hashedUsers, { ordered: false });
    console.log("Batch inserted all users directly into DB");

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
