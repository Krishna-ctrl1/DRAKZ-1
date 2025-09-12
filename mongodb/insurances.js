import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const insuranceTypes = [
  { type: 'health', baseValue: 500000, basePremium: 12000 },
  { type: 'life', baseValue: 1000000, basePremium: 25000 },
  { type: 'auto', baseValue: 300000, basePremium: 8000 },
  { type: 'home', baseValue: 2000000, basePremium: 15000 },
  { type: 'term', baseValue: 5000000, basePremium: 18000 }
];

function generateRandomInsurances(peopleIds) {
  const insurances = [];
  
  peopleIds.forEach(peopleId => {
    const numPolicies = Math.floor(Math.random() * 4) + 2; // 2-5 policies per person
    
    for (let i = 0; i < numPolicies; i++) {
      const insurance = insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)];
      const value = Math.round(insurance.baseValue * (Math.random() * 0.8 + 0.6)); // 60%-140% of base
      const premium = Math.round(insurance.basePremium * (Math.random() * 0.6 + 0.7)); // 70%-130% of base
      
      // Generate random gains/losses
      const hasGainLoss = Math.random() > 0.7; // 30% chance of having gain/loss
      let gain = 0, loss = 0;
      if (hasGainLoss) {
        if (Math.random() > 0.5) {
          gain = Math.floor(Math.random() * premium * 0.5); // Up to 50% of premium as gain
        } else {
          loss = Math.floor(Math.random() * premium * 0.3); // Up to 30% of premium as loss
        }
      }
      
      insurances.push({
        people_id: peopleId,
        policy_type: insurance.type,
        policy_id: `POL${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        value: value,
        currency: 'INR',
        gain: gain,
        loss: loss
      });
    }
  });
  
  return insurances;
}

async function insertInsurances() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate insurance data
    const insurancesData = generateRandomInsurances(peopleIds);
    
    const collection = db.collection('insurances');
    const result = await collection.insertMany(insurancesData);
    console.log(`${result.insertedCount} insurance records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting insurances:', error);
  } finally {
    await client.close();
  }
}

insertInsurances();