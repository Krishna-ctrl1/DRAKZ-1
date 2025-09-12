import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

async function insertUsersAdvisors() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const usersCollection = db.collection('users');
    const advisorsCollection = db.collection('advisors');
    const usersAdvisorsCollection = db.collection('users_advisors');
    
    // Get actual user and advisor IDs from database
    const users = await usersCollection.find({}).toArray();
    const advisors = await advisorsCollection.find({}).toArray();
    
    if (users.length === 0 || advisors.length === 0) {
      console.log('Please insert users and advisors first before running this script');
      return;
    }
    
    // Assign users to advisors (distributing evenly)
    const usersAdvisorsData = [];
    
    users.forEach((user, index) => {
      // Distribute users between advisors (round-robin)
      const advisorIndex = index % advisors.length;
      
      usersAdvisorsData.push({
        user_id: user._id,
        advisor_id: advisors[advisorIndex]._id,
        assigned_date: new Date(2024, index, 15 + index) // Staggered assignment dates
      });
    });
    
    const result = await usersAdvisorsCollection.insertMany(usersAdvisorsData);
    console.log(`${result.insertedCount} user-advisor mappings inserted successfully`);
    
    // Display the mappings
    console.log('\nUser-Advisor Mappings:');
    usersAdvisorsData.forEach((mapping, index) => {
      const user = users.find(u => u._id.equals(mapping.user_id));
      const advisor = advisors.find(a => a._id.equals(mapping.advisor_id));
      console.log(`${user.name} (${user.email}) → ${advisor.name} (${advisor.specialization})`);
    });
    
  } catch (error) {
    console.error('Error inserting user-advisor mappings:', error);
  } finally {
    await client.close();
  }
}

insertUsersAdvisors();