import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const investmentTypes = [
  { type: 'FD', minAmount: 10000, maxAmount: 500000, minTenure: 12, maxTenure: 60 },
  { type: 'mutual fund', minAmount: 5000, maxAmount: 200000, minTenure: 12, maxTenure: 120 },
  { type: 'bonds', minAmount: 50000, maxAmount: 1000000, minTenure: 24, maxTenure: 120 },
  { type: 'PPF', minAmount: 15000, maxAmount: 150000, minTenure: 180, maxTenure: 180 },
  { type: 'ELSS', minAmount: 50000, maxAmount: 150000, minTenure: 36, maxTenure: 36 }
];

function generateRandomInvestments(peopleIds) {
  const investments = [];
  
  peopleIds.forEach(peopleId => {
    const numInvestments = Math.floor(Math.random() * 5) + 2; // 2-6 investments per person
    
    for (let i = 0; i < numInvestments; i++) {
      const investment = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
      const amount = Math.floor(Math.random() * (investment.maxAmount - investment.minAmount)) + investment.minAmount;
      const tenure = Math.floor(Math.random() * (investment.maxTenure - investment.minTenure)) + investment.minTenure;
      const startDate = new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + tenure);
      
      investments.push({
        people_id: peopleId,
        investment_type: investment.type,
        amount: amount,
        start_date: startDate,
        maturity_date: maturityDate
      });
    }
  });
  
  return investments;
}

async function insertInvestments() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate investment data
    const investmentsData = generateRandomInvestments(peopleIds);
    
    const collection = db.collection('investments');
    const result = await collection.insertMany(investmentsData);
    console.log(`${result.insertedCount} investment records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting investments:', error);
  } finally {
    await client.close();
  }
}

insertInvestments();