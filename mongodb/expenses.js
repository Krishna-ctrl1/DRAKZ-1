import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const expenseCategories = [
  { category: 'food', minAmount: 500, maxAmount: 5000 },
  { category: 'travel', minAmount: 1000, maxAmount: 15000 },
  { category: 'utilities', minAmount: 2000, maxAmount: 8000 },
  { category: 'entertainment', minAmount: 500, maxAmount: 3000 },
  { category: 'shopping', minAmount: 1000, maxAmount: 10000 },
  { category: 'healthcare', minAmount: 1000, maxAmount: 20000 },
  { category: 'education', minAmount: 2000, maxAmount: 25000 },
  { category: 'fuel', minAmount: 1500, maxAmount: 6000 },
  { category: 'rent', minAmount: 15000, maxAmount: 50000 },
  { category: 'groceries', minAmount: 3000, maxAmount: 12000 }
];

function generateRandomExpenses(peopleIds) {
  const expenses = [];
  
  peopleIds.forEach(peopleId => {
    // Generate 20-40 expense records per person for the last 6 months
    const numExpenses = Math.floor(Math.random() * 21) + 20;
    
    for (let i = 0; i < numExpenses; i++) {
      const expense = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amount = Math.floor(Math.random() * (expense.maxAmount - expense.minAmount)) + expense.minAmount;
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6)); // Last 6 months
      date.setDate(Math.floor(Math.random() * 28) + 1);
      
      expenses.push({
        people_id: peopleId,
        category: expense.category,
        amount: amount,
        date: date
      });
    }
  });
  
  return expenses;
}

async function insertExpenses() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate expense data
    const expensesData = generateRandomExpenses(peopleIds);
    
    const collection = db.collection('expenses');
    const result = await collection.insertMany(expensesData);
    console.log(`${result.insertedCount} expense records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting expenses:', error);
  } finally {
    await client.close();
  }
}

insertExpenses();