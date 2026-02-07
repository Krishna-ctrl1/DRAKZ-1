/**
 * Quick check script for advisor-client assignments
 */
require('dotenv').config();
const mongoose = require('mongoose');
require('./src/config/db.config.js')();

const Person = require('./src/models/people.model.js');
const AdvisorRequest = require('./src/models/advisorRequest.model.js');

async function check() {
    try {
        await new Promise(r => setTimeout(r, 2000));

        console.log('=== ADVISORS ===');
        const advisors = await Person.find({ role: 'advisor' }).select('_id name email');
        advisors.forEach(a => console.log(`ID: ${a._id} | Name: ${a.name} | Email: ${a.email}`));

        console.log('\n=== USERS WITH ASSIGNED ADVISOR ===');
        const usersWithAdvisor = await Person.find({
            assignedAdvisor: { $exists: true, $ne: null }
        }).select('name email assignedAdvisor').populate('assignedAdvisor', 'name email');

        if (usersWithAdvisor.length === 0) {
            console.log('No users have assigned advisors');
        } else {
            usersWithAdvisor.forEach(u => {
                console.log(`User: ${u.name} (${u.email}) -> Advisor: ${u.assignedAdvisor?.name}`);
            });
        }

        console.log('\n=== PENDING REQUESTS ===');
        const requests = await AdvisorRequest.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('advisor', 'name email');

        if (requests.length === 0) {
            console.log('No pending requests');
        } else {
            requests.forEach(r => {
                console.log(`From: ${r.user?.name} -> To: ${r.advisor?.name}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
