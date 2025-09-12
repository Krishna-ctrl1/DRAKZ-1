import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const usersData = [
  {
    name: "Ahmed Zulqar",
    email: "ahmed.z23@iiits.in",
    password: "user_ahmed",
    people_id: null,
    role: "normal",
    created_at: new Date()
  },
  {
    name: "Krishna Govind",
    email: "krishna.g23@iiits.in",
    password: "user_krishna",
    people_id: null,
    role: "normal",
    created_at: new Date()
  },
  {
    name: "Ragamaie N",
    email: "ragamaie.n23@iiits.in",
    password: "user_ragamaie",
    people_id: null,
    role: "premium",
    created_at: new Date()
  },
  {
    name: "Deepthi M",
    email: "deepthi.m23@iiits.in",
    password: "user_deepthi",
    people_id: null,
    role: "normal",
    created_at: new Date()
  },
  {
    name: "Abhinay M",
    email: "abhinay.m23@iiits.in",
    password: "user_abhinay",
    people_id: null,
    role: "premium",
    created_at: new Date()
  }
];

async function insertUsers() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('users');
    
    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password_hash: await bcrypt.hash(user.password, 10)
      }))
    );
    
    // Remove plain password field
    usersWithHashedPasswords.forEach(user => delete user.password);
    
    const result = await collection.insertMany(usersWithHashedPasswords);
    console.log(`${result.insertedCount} users inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting users:', error);
  } finally {
    await client.close();
  }
}

insertUsers();