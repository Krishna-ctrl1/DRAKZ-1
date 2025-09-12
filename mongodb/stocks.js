import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from parent directory
config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertStocks() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('stocks');
    
    const stocksData = [
      {
        people_id: 1, // Will need to match with actual people._id from your people collection
        symbol: 'RELIANCE',
        quantity: 50,
        avg_buy_price: 2450.75,
        current_price: 2680.50
      },
      {
        people_id: 1,
        symbol: 'TCS',
        quantity: 25,
        avg_buy_price: 3200.00,
        current_price: 3450.25
      },
      {
        people_id: 2,
        symbol: 'INFY',
        quantity: 100,
        avg_buy_price: 1450.50,
        current_price: 1520.75
      },
      {
        people_id: 2,
        symbol: 'HDFC',
        quantity: 75,
        avg_buy_price: 1650.25,
        current_price: 1720.00
      },
      {
        people_id: 3,
        symbol: 'ICICIBANK',
        quantity: 200,
        avg_buy_price: 850.00,
        current_price: 920.50
      },
      {
        people_id: 4,
        symbol: 'SBIN',
        quantity: 150,
        avg_buy_price: 420.75,
        current_price: 465.25
      },
      {
        people_id: 5,
        symbol: 'ITC',
        quantity: 300,
        avg_buy_price: 245.50,
        current_price: 268.75
      }
    ];
    
    const result = await collection.insertMany(stocksData);
    console.log(`${result.insertedCount} stocks inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting stocks:', error);
  } finally {
    await client.close();
  }
}

insertStocks();