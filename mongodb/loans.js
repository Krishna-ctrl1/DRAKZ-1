import { MongoClient } from "mongodb";
import { config } from "dotenv";

// Load environment variables from parent directory
config({ path: "../.env" });

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertLoans() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("fdfed");
    const collection = db.collection("loans");

    const loansData = [
      {
        people_id: 1,
        loan_type: "Home Loan",
        loan_amount: 5000000,
        interest_rate: 8.5,
        tenure: 240, // months
        remaining_amount: 3250000,
      },
      {
        people_id: 1,
        loan_type: "Personal Loan",
        loan_amount: 200000,
        interest_rate: 12.5,
        tenure: 36,
        remaining_amount: 85000,
      },
      {
        people_id: 2,
        loan_type: "Car Loan",
        loan_amount: 800000,
        interest_rate: 9.2,
        tenure: 84,
        remaining_amount: 450000,
      },
      {
        people_id: 3,
        loan_type: "Education Loan",
        loan_amount: 1500000,
        interest_rate: 7.5,
        tenure: 120,
        remaining_amount: 1200000,
      },
      {
        people_id: 4,
        loan_type: "Home Loan",
        loan_amount: 3500000,
        interest_rate: 8.75,
        tenure: 300,
        remaining_amount: 2800000,
      },
      {
        people_id: 5,
        loan_type: "Business Loan",
        loan_amount: 1000000,
        interest_rate: 11.5,
        tenure: 60,
        remaining_amount: 650000,
      },
    ];

    const result = await collection.insertMany(loansData);
    console.log(`${result.insertedCount} loans inserted successfully`);
  } catch (error) {
    console.error("Error inserting loans:", error);
  } finally {
    await client.close();
  }
}

insertLoans();
