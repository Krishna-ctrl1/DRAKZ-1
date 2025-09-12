import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const mutualFunds = [
  { schemeName: 'HDFC Top 100 Fund', fundHouse: 'HDFC Mutual Fund', nav: 750 },
  { schemeName: 'ICICI Pru Bluechip Fund', fundHouse: 'ICICI Prudential MF', nav: 65 },
  { schemeName: 'SBI Large Cap Fund', fundHouse: 'SBI Mutual Fund', nav: 85 },
  { schemeName: 'Axis Large Cap Fund', fundHouse: 'Axis Mutual Fund', nav: 42 },
  { schemeName: 'Kotak Select Focus Fund', fundHouse: 'Kotak Mutual Fund', nav: 58 },
  { schemeName: 'Mirae Asset Large Cap Fund', fundHouse: 'Mirae Asset MF', nav: 98 },
  { schemeName: 'UTI Nifty Fund', fundHouse: 'UTI Mutual Fund', nav: 178 },
  { schemeName: 'Franklin India Bluechip Fund', fundHouse: 'Franklin Templeton MF', nav: 125 }
];

function generateRandomMutualFunds(peopleIds) {
  const mutualFundsData = [];
  
  peopleIds.forEach(peopleId => {
    const numFunds = Math.floor(Math.random() * 5) + 2; // 2-6 mutual funds per person
    
    for (let i = 0; i < numFunds; i++) {
      const fund = mutualFunds[Math.floor(Math.random() * mutualFunds.length)];
      const units = Math.floor(Math.random() * 500) + 10; // 10-510 units
      const investmentDate = new Date();
      investmentDate.setMonth(investmentDate.getMonth() - Math.floor(Math.random() * 24)); // Last 2 years
      
      const currentValue = units * fund.nav;
      const sipAmount = Math.random() > 0.5 ? Math.floor(Math.random() * 10000) + 1000 : null; // 50% chance of SIP
      
      mutualFundsData.push({
        people_id: peopleId,
        scheme_name: fund.schemeName,
        fund_house: fund.fundHouse,
        nav: fund.nav,
        units: units,
        investment_date: investmentDate,
        current_value: currentValue,
        sip_amount: sipAmount
      });
    }
  });
  
  return mutualFundsData;
}

async function insertMutualFunds() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate mutual funds data
    const mutualFundsData = generateRandomMutualFunds(peopleIds);
    
    const collection = db.collection('mutual_funds');
    const result = await collection.insertMany(mutualFundsData);
    console.log(`${result.insertedCount} mutual fund records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting mutual funds:', error);
  } finally {
    await client.close();
  }
}

insertMutualFunds();