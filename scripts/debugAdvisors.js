/**
 * Debug script - Show all advisor/user assignments
 */
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/drakz')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const Person = require('../src/models/people.model.js');

async function debug() {
    try {
        await new Promise(r => setTimeout(r, 2000));

        console.log('\n=== ADVISORS ===');
        const advisors = await Person.find({ role: 'advisor' }).select('_id name email');
        advisors.forEach(a => {
            console.log(`  ID: ${a._id.toString()}`);
            console.log(`  Name: ${a.name}`);
            console.log(`  Email: ${a.email}`);
            console.log('');
        });

        console.log('\n=== USERS WITH ASSIGNED ADVISOR ===');
        const users = await Person.find({
            role: 'user',
            assignedAdvisor: { $ne: null }
        }).select('_id name assignedAdvisor').populate('assignedAdvisor', 'name email');

        if (users.length === 0) {
            console.log('  No users have assigned advisors!');
        } else {
            users.forEach(u => {
                console.log(`  User: ${u.name}`);
                console.log(`  User ID: ${u._id.toString()}`);
                console.log(`  Assigned Advisor: ${u.assignedAdvisor?.name} (${u.assignedAdvisor?._id})`);
                console.log('');
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

debug();
