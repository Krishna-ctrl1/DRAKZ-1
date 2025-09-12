import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const adminsData = [
  {
    name: "Krishna Gupta",
    email: "krishna.gpt607@gmail.com",
    password: "admin_krishna",
    dob: new Date('1995-03-15')
  },
  {
    name: "Ziko Ahmed",
    email: "ziko120204@gmail.com",
    password: "admin_ziko",
    dob: new Date('1998-12-02')
  }
];

async function insertAdmins() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('admins');
    
    const adminsWithHashedPasswords = await Promise.all(
      adminsData.map(async (admin) => ({
        ...admin,
        password_hash: await bcrypt.hash(admin.password, 10)
      }))
    );
    
    adminsWithHashedPasswords.forEach(admin => delete admin.password);
    
    const result = await collection.insertMany(adminsWithHashedPasswords);
    console.log(`${result.insertedCount} admins inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting admins:', error);
  } finally {
    await client.close();
  }
}

insertAdmins();