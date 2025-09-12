import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const bankDetails = [
  { name: 'HDFC Bank', ifscPrefix: 'HDFC0', branches: ['Gachibowli', 'Madhapur', 'Kondapur', 'HITEC City'] },
  { name: 'ICICI Bank', ifscPrefix: 'ICIC0', branches: ['Jubilee Hills', 'Banjara Hills', 'Ameerpet', 'Secunderabad'] },
  { name: 'SBI', ifscPrefix: 'SBIN0', branches: ['Kukatpally', 'Miyapur', 'Begumpet', 'Somajiguda'] },
  { name: 'Axis Bank', ifscPrefix: 'UTIB0', branches: ['Financial District', 'Gachibowli', 'Madhapur', 'Kondapur'] },
  { name: 'Kotak Bank', ifscPrefix: 'KKBK0', branches: ['Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Gachibowli'] }
];

const accountTypes = ['savings', 'current', 'salary'];

function generateRandomBankAccounts(peopleIds) {
  const bankAccounts = [];
  
  peopleIds.forEach(peopleId => {
    const numAccounts = Math.floor(Math.random() * 3) + 2; // 2-4 accounts per person
    
    for (let i = 0; i < numAccounts; i++) {
      const bank = bankDetails[Math.floor(Math.random() * bankDetails.length)];
      const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const branch = bank.branches[Math.floor(Math.random() * bank.branches.length)];
      
      const accountNumber = Math.floor(Math.random() * 9000000000000000) + 1000000000000000; // 16 digit account number
      const ifscCode = `${bank.ifscPrefix}${Math.floor(Math.random() * 900000) + 100000}`;
      const balance = Math.floor(Math.random() * 500000) + 10000; // 10K to 5L balance
      
      bankAccounts.push({
        people_id: peopleId,
        bank_name: bank.name,
        account_type: accountType,
        account_number: accountNumber.toString(),
        balance: balance,
        ifsc_code: ifscCode,
        branch: branch
      });
    }
  });
  
  return bankAccounts;
}

async function insertBankAccounts() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate bank account data
    const bankAccountsData = generateRandomBankAccounts(peopleIds);
    
    const collection = db.collection('bank_accounts');
    const result = await collection.insertMany(bankAccountsData);
    console.log(`${result.insertedCount} bank account records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting bank accounts:', error);
  } finally {
    await client.close();
  }
}

insertBankAccounts();