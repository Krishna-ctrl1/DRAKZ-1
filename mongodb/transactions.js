import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

// Helper function to generate random transaction data
function generateRandomTransactions(peopleIds) {
  const categories = ['investment', 'expense', 'loan repayment', 'salary', 'freelancing', 'dividend', 'rent', 'groceries', 'utilities', 'entertainment'];
  const transactions = [];
  
  peopleIds.forEach(peopleId => {
    // Generate 10-20 random transactions per person
    const numTransactions = Math.floor(Math.random() * 11) + 10;
    
    for (let i = 0; i < numTransactions; i++) {
      const isCredit = Math.random() > 0.4; 
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      transactions.push({
        people_id: peopleId,
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        type: isCredit ? 'credit' : 'debit',
        amount: Math.floor(Math.random() * 50000) + 1000,
        category: category
      });
    }
  });
  
  return transactions;
}

async function insertTransactions() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate transaction data
    const transactionsData = generateRandomTransactions(peopleIds);
    
    const collection = db.collection('transactions');
    const result = await collection.insertMany(transactionsData);
    console.log(`${result.insertedCount} transactions inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting transactions:', error);
  } finally {
    await client.close();
  }
}

insertTransactions();