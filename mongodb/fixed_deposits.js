import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from parent directory
config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertFixedDeposits() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('fixed_deposits');
    
    const fixedDepositsData = [
      {
        people_id: 1,
        bank_name: 'State Bank of India',
        amount: 500000,
        interest_rate: 6.8,
        start_date: new Date('2023-01-15'),
        maturity_date: new Date('2025-01-15'),
        status: 'active'
      },
      {
        people_id: 1,
        bank_name: 'HDFC Bank',
        amount: 300000,
        interest_rate: 7.2,
        start_date: new Date('2022-06-10'),
        maturity_date: new Date('2024-06-10'),
        status: 'matured'
      },
      {
        people_id: 2,
        bank_name: 'ICICI Bank',
        amount: 750000,
        interest_rate: 6.9,
        start_date: new Date('2023-03-20'),
        maturity_date: new Date('2026-03-20'),
        status: 'active'
      },
      {
        people_id: 3,
        bank_name: 'Axis Bank',
        amount: 400000,
        interest_rate: 7.0,
        start_date: new Date('2023-08-05'),
        maturity_date: new Date('2025-08-05'),
        status: 'active'
      },
      {
        people_id: 4,
        bank_name: 'Punjab National Bank',
        amount: 600000,
        interest_rate: 6.75,
        start_date: new Date('2022-12-01'),
        maturity_date: new Date('2025-12-01'),
        status: 'active'
      },
      {
        people_id: 5,
        bank_name: 'Canara Bank',
        amount: 250000,
        interest_rate: 6.5,
        start_date: new Date('2023-05-15'),
        maturity_date: new Date('2024-05-15'),
        status: 'active'
      }
    ];
    
    const result = await collection.insertMany(fixedDepositsData);
    console.log(`${result.insertedCount} fixed deposits inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting fixed deposits:', error);
  } finally {
    await client.close();
  }
}

insertFixedDeposits();