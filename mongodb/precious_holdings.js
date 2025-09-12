import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const preciousItems = [
  { name: 'Gold Coins (24K)', weight: 10, purchasedValue: 50000, currentValue: 55000 },
  { name: 'Silver Bars', weight: 100, purchasedValue: 60000, currentValue: 65000 },
  { name: 'Gold Jewelry', weight: 25, purchasedValue: 120000, currentValue: 135000 },
  { name: 'Platinum Coins', weight: 5, purchasedValue: 15000, currentValue: 16500 },
  { name: 'Gold Biscuits', weight: 20, purchasedValue: 100000, currentValue: 110000 },
  { name: 'Silver Coins', weight: 50, purchasedValue: 30000, currentValue: 32000 }
];

function generateRandomPreciousHoldings(peopleIds) {
  const holdings = [];
  
  peopleIds.forEach(peopleId => {
    // 70% chance of having precious metal holdings
    if (Math.random() > 0.3) {
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
      
      for (let i = 0; i < numItems; i++) {
        const item = preciousItems[Math.floor(Math.random() * preciousItems.length)];
        const weightVariation = Math.random() * 0.4 + 0.8; // 80%-120% of base weight
        const weight = Math.round(item.weight * weightVariation);
        const purchaseDate = new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        holdings.push({
          people_id: peopleId,
          item_name: item.name,
          weight: weight,
          purchased_value: Math.round(item.purchasedValue * weightVariation),
          current_value: Math.round(item.currentValue * weightVariation),
          purchase_date: purchaseDate
        });
      }
    }
  });
  
  return holdings;
}

async function insertPreciousHoldings() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate precious holdings data
    const holdingsData = generateRandomPreciousHoldings(peopleIds);
    
    const collection = db.collection('precious_holdings');
    const result = await collection.insertMany(holdingsData);
    console.log(`${result.insertedCount} precious holdings records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting precious holdings:', error);
  } finally {
    await client.close();
  }
}

insertPreciousHoldings();