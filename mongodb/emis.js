import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from parent directory
config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertEMIs() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('emis');
    
    const emisData = [
      {
        people_id: 1,
        emi_type: 'loan',
        monthly_amount: 45000,
        remaining_months: 180,
        next_due_date: new Date('2024-09-05')
      },
      {
        people_id: 1,
        emi_type: 'credit_card',
        monthly_amount: 8500,
        remaining_months: 12,
        next_due_date: new Date('2024-09-15')
      },
      {
        people_id: 2,
        emi_type: 'loan',
        monthly_amount: 12500,
        remaining_months: 48,
        next_due_date: new Date('2024-09-10')
      },
      {
        people_id: 2,
        emi_type: 'subscription',
        monthly_amount: 1500,
        remaining_months: 24,
        next_due_date: new Date('2024-08-30')
      },
      {
        people_id: 3,
        emi_type: 'loan',
        monthly_amount: 18000,
        remaining_months: 84,
        next_due_date: new Date('2024-09-20')
      },
      {
        people_id: 4,
        emi_type: 'loan',
        monthly_amount: 25000,
        remaining_months: 220,
        next_due_date: new Date('2024-09-01')
      },
      {
        people_id: 4,
        emi_type: 'subscription',
        monthly_amount: 2500,
        remaining_months: 36,
        next_due_date: new Date('2024-08-28')
      },
      {
        people_id: 5,
        emi_type: 'loan',
        monthly_amount: 22000,
        remaining_months: 36,
        next_due_date: new Date('2024-09-12')
      }
    ];
    
    const result = await collection.insertMany(emisData);
    console.log(`${result.insertedCount} EMIs inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting EMIs:', error);
  } finally {
    await client.close();
  }
}

insertEMIs();