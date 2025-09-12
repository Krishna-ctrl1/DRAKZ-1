import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const bankNames = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'IDFC First Bank', 'Yes Bank', 'IndusInd Bank'];
const cardTypes = ['credit', 'debit'];

function generateRandomCards(peopleIds) {
  const cards = [];
  
  peopleIds.forEach(peopleId => {
    const numCards = Math.floor(Math.random() * 4) + 2; // 2-5 cards per person
    
    for (let i = 0; i < numCards; i++) {
      const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      const bankName = bankNames[Math.floor(Math.random() * bankNames.length)];
      
      // Credit cards have limits, debit cards don't
      const limit = cardType === 'credit' ? Math.floor(Math.random() * 500000) + 50000 : null;
      
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 4) + 1); // 1-4 years from now
      
      cards.push({
        people_id: peopleId,
        card_type: cardType,
        bank_name: bankName,
        limit: limit,
        expiry_date: expiryDate
      });
    }
  });
  
  return cards;
}

async function insertCards() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate card data
    const cardsData = generateRandomCards(peopleIds);
    
    const collection = db.collection('cards');
    const result = await collection.insertMany(cardsData);
    console.log(`${result.insertedCount} card records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting cards:', error);
  } finally {
    await client.close();
  }
}

insertCards();