import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const advisorsData = [
  {
    name: "XD Phantom",
    email: "xdphantom1202@gmail.com",
    password: "advisor_xd",
    specialization: "stocks",
    rating: 4.7
  },
  {
    name: "Zulqar Ahmed",
    email: "zulqar.ahmed.12@gmail.com",
    password: "advisor_zulqar",
    specialization: "investments",
    rating: 4.5
  }
];

async function insertAdvisors() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('advisors');
    
    const advisorsWithHashedPasswords = await Promise.all(
      advisorsData.map(async (advisor) => ({
        ...advisor,
        password_hash: await bcrypt.hash(advisor.password, 10)
      }))
    );
    
    advisorsWithHashedPasswords.forEach(advisor => delete advisor.password);
    
    const result = await collection.insertMany(advisorsWithHashedPasswords);
    console.log(`${result.insertedCount} advisors inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting advisors:', error);
  } finally {
    await client.close();
  }
}

insertAdvisors();