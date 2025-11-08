// scripts/seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Person from '../model/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { email: 'admin1@drakz.com', password: 'Admin1@123', role: 'admin', name: 'Admin 1' },
  { email: 'admin2@drakz.com', password: 'Admin2@123', role: 'admin', name: 'Admin 2' },
  { email: 'advisor1@drakz.com', password: 'Advisor1@123', role: 'advisor', name: 'Advisor 1' },
  { email: 'advisor2@drakz.com', password: 'Advisor2@123', role: 'advisor', name: 'Advisor 2' },
  { email: 'user1@drakz.com', password: 'User1@123', role: 'user', name: 'User 1' },
  { email: 'user2@drakz.com', password: 'User2@123', role: 'user', name: 'User 2' },
  { email: 'user3@drakz.com', password: 'User3@123', role: 'user', name: 'User 3' },
  { email: 'user4@drakz.com', password: 'User4@123', role: 'user', name: 'User 4' },
  { email: 'user5@drakz.com', password: 'User5@123', role: 'user', name: 'User 5' },
];

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/checkingdb');
    console.log('✅ Connected to MongoDB');

    await Person.deleteMany({});
    console.log('🗑️ Cleared Person collection');

    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );

    await Person.insertMany(hashedUsers);
    console.log('✅ Inserted seed user accounts');

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
