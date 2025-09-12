import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const peopleData = [
  // Users from the system
  {
    pan: "AHMED1234A",
    full_name: "Ahmed Zulqar",
    dob: new Date('2001-12-02'),
    occupation: "Software Engineer",
    annual_income: 1200000,
    credit_score: 750,
    credit_history_length: 3,
    last_credit_update: new Date('2024-01-15'),
    tax_bracket: "20%",
    last_itr_filed: new Date('2024-07-31'),
    tax_savings_investments: 150000,
    emergency_fund_target: 600000,
    emergency_fund_current: 350000,
    liquid_cash: 50000
  },
  {
    pan: "KRISH5678B",
    full_name: "Krishna Gupta",
    dob: new Date('2001-06-15'),
    occupation: "Data Scientist",
    annual_income: 1500000,
    credit_score: 780,
    credit_history_length: 4,
    last_credit_update: new Date('2024-02-10'),
    tax_bracket: "20%",
    last_itr_filed: new Date('2024-07-20'),
    tax_savings_investments: 180000,
    emergency_fund_target: 750000,
    emergency_fund_current: 400000,
    liquid_cash: 75000
  },
  {
    pan: "RAGAM9012C",
    full_name: "Ragamaie N",
    dob: new Date('2001-09-22'),
    occupation: "Product Manager",
    annual_income: 1800000,
    credit_score: 800,
    credit_history_length: 5,
    last_credit_update: new Date('2024-01-25'),
    tax_bracket: "30%",
    last_itr_filed: new Date('2024-07-15'),
    tax_savings_investments: 200000,
    emergency_fund_target: 900000,
    emergency_fund_current: 500000,
    liquid_cash: 100000
  },
  {
    pan: "DEEPT3456D",
    full_name: "Deepthi M",
    dob: new Date('2001-04-08'),
    occupation: "UI/UX Designer",
    annual_income: 1000000,
    credit_score: 720,
    credit_history_length: 2,
    last_credit_update: new Date('2024-03-01'),
    tax_bracket: "10%",
    last_itr_filed: new Date('2024-07-25'),
    tax_savings_investments: 120000,
    emergency_fund_target: 500000,
    emergency_fund_current: 200000,
    liquid_cash: 30000
  },
  {
    pan: "ABHIN7890E",
    full_name: "Abhinay M",
    dob: new Date('2001-11-30'),
    occupation: "DevOps Engineer",
    annual_income: 1400000,
    credit_score: 760,
    credit_history_length: 3,
    last_credit_update: new Date('2024-02-20'),
    tax_bracket: "20%",
    last_itr_filed: new Date('2024-07-10'),
    tax_savings_investments: 170000,
    emergency_fund_target: 700000,
    emergency_fund_current: 300000,
    liquid_cash: 60000
  },
  // Additional dummy data for global pool
  {
    pan: "ZIKO11234F",
    full_name: "Ziko Ahmed",
    dob: new Date('1998-12-02'),
    occupation: "Full Stack Developer",
    annual_income: 1600000,
    credit_score: 790,
    credit_history_length: 6,
    last_credit_update: new Date('2024-01-30'),
    tax_bracket: "30%",
    last_itr_filed: new Date('2024-07-28'),
    tax_savings_investments: 190000,
    emergency_fund_target: 800000,
    emergency_fund_current: 450000,
    liquid_cash: 80000
  },
  {
    pan: "ONTUN5678G",
    full_name: "Ahmed Ontune",
    dob: new Date('1995-03-15'),
    occupation: "AI Researcher",
    annual_income: 2000000,
    credit_score: 820,
    credit_history_length: 8,
    last_credit_update: new Date('2024-02-15'),
    tax_bracket: "30%",
    last_itr_filed: new Date('2024-07-12'),
    tax_savings_investments: 250000,
    emergency_fund_target: 1000000,
    emergency_fund_current: 600000,
    liquid_cash: 120000
  },
  {
    pan: "DRAKZ9012H",
    full_name: "Drakz Fintech",
    dob: new Date('1990-08-20'),
    occupation: "Fintech Entrepreneur",
    annual_income: 2500000,
    credit_score: 850,
    credit_history_length: 10,
    last_credit_update: new Date('2024-01-10'),
    tax_bracket: "30%",
    last_itr_filed: new Date('2024-07-05'),
    tax_savings_investments: 300000,
    emergency_fund_target: 1250000,
    emergency_fund_current: 800000,
    liquid_cash: 150000
  }
];

async function insertPeople() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    const collection = db.collection('people');
    
    // Create unique index on PAN
    await collection.createIndex({ pan: 1 }, { unique: true });
    
    const result = await collection.insertMany(peopleData);
    console.log(`${result.insertedCount} people records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting people:', error);
  } finally {
    await client.close();
  }
}

insertPeople();