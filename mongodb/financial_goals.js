import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from parent directory
config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertFinancialGoals() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('financial_goals');
    
    const goalsData = [
      {
        people_id: 1,
        goal_name: 'Emergency Fund',
        target_amount: 600000,
        current_amount: 350000,
        target_date: new Date('2025-06-30'),
        priority: 'high',
        status: 'active'
      },
      {
        people_id: 1,
        goal_name: 'Vacation to Europe',
        target_amount: 400000,
        current_amount: 150000,
        target_date: new Date('2025-12-31'),
        priority: 'medium',
        status: 'active'
      },
      {
        people_id: 2,
        goal_name: 'Child Education Fund',
        target_amount: 2500000,
        current_amount: 800000,
        target_date: new Date('2030-06-15'),
        priority: 'high',
        status: 'active'
      },
      {
        people_id: 2,
        goal_name: 'New Car Purchase',
        target_amount: 1200000,
        current_amount: 450000,
        target_date: new Date('2025-04-30'),
        priority: 'medium',
        status: 'active'
      },
      {
        people_id: 3,
        goal_name: 'House Down Payment',
        target_amount: 1500000,
        current_amount: 650000,
        target_date: new Date('2026-03-31'),
        priority: 'high',
        status: 'active'
      },
      {
        people_id: 3,
        goal_name: 'Retirement Fund',
        target_amount: 10000000,
        current_amount: 1200000,
        target_date: new Date('2050-12-31'),
        priority: 'high',
        status: 'active'
      },
      {
        people_id: 4,
        goal_name: 'Business Investment',
        target_amount: 800000,
        current_amount: 300000,
        target_date: new Date('2025-09-30'),
        priority: 'medium',
        status: 'active'
      },
      {
        people_id: 4,
        goal_name: 'Wedding Fund',
        target_amount: 1000000,
        current_amount: 1000000,
        target_date: new Date('2024-02-14'),
        priority: 'high',
        status: 'completed'
      },
      {
        people_id: 5,
        goal_name: 'Higher Education',
        target_amount: 2000000,
        current_amount: 750000,
        target_date: new Date('2026-06-30'),
        priority: 'high',
        status: 'active'
      },
      {
        people_id: 5,
        goal_name: 'Emergency Fund',
        target_amount: 400000,
        current_amount: 200000,
        target_date: new Date('2025-03-31'),
        priority: 'high',
        status: 'active'
      }
    ];
    
    const result = await collection.insertMany(goalsData);
    console.log(`${result.insertedCount} financial goals inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting financial goals:', error);
  } finally {
    await client.close();
  }
}

insertFinancialGoals();