/**
 * Setup script - Update advisors and assign test user
 * Run with: node scripts/setupAdvisorData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/drakz')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const Person = require('../src/models/people.model.js');
const AdvisorRequest = require('../src/models/advisorRequest.model.js');

async function setup() {
    try {
        console.log('\n🔄 Setting up advisor data...\n');

        // Get all advisors
        const advisors = await Person.find({ role: 'advisor' });
        console.log(`📋 Found ${advisors.length} advisors`);

        if (advisors.length === 0) {
            console.log('❌ No advisors found. Creating sample advisors...');

            // Create sample advisors
            const advisor1 = await Person.create({
                name: 'Advisor 1',
                email: 'advisor1@drakz.com',
                password: '$2a$10$CwTycUXWue0Thq9StjUM0u4VcFj/lWBwQPDOxUG4Fz4dXqS8R4bRy', // password123
                role: 'advisor',
                advisorProfile: {
                    price: 2500,
                    certificate: 'CFP (Certified Financial Planner)',
                    specialization: 'Retirement Planning',
                    bio: 'Expert in retirement planning with 10+ years of experience helping clients achieve their financial goals.',
                    contactEmail: 'advisor1@drakz.com',
                    contactPhone: '+91 98765 43210',
                    experience: 10,
                    isAcceptingClients: true
                }
            });

            const advisor2 = await Person.create({
                name: 'Advisor 2',
                email: 'advisor2@drakz.com',
                password: '$2a$10$CwTycUXWue0Thq9StjUM0u4VcFj/lWBwQPDOxUG4Fz4dXqS8R4bRy', // password123
                role: 'advisor',
                advisorProfile: {
                    price: 3000,
                    certificate: 'CFA (Chartered Financial Analyst)',
                    specialization: 'Investment Management',
                    bio: 'Specializing in portfolio optimization and wealth management for high net-worth individuals.',
                    contactEmail: 'advisor2@drakz.com',
                    contactPhone: '+91 98765 43211',
                    experience: 8,
                    isAcceptingClients: true
                }
            });

            console.log(`✅ Created advisors: ${advisor1.name}, ${advisor2.name}`);
        } else {
            // Update existing advisors with profiles if they don't have one
            for (const advisor of advisors) {
                if (!advisor.advisorProfile || !advisor.advisorProfile.price) {
                    await Person.findByIdAndUpdate(advisor._id, {
                        advisorProfile: {
                            price: 2500,
                            certificate: 'CFP (Certified Financial Planner)',
                            specialization: 'Financial Planning',
                            bio: `Expert financial advisor with years of experience helping clients achieve their goals.`,
                            contactEmail: advisor.email,
                            contactPhone: '+91 98765 43210',
                            experience: 10,
                            isAcceptingClients: true
                        }
                    });
                    console.log(`✅ Updated profile for ${advisor.name}`);
                } else {
                    console.log(`  ✓ ${advisor.name} already has a profile`);
                }
            }
        }

        // Get all users
        const users = await Person.find({ role: 'user' });
        console.log(`\n📋 Found ${users.length} users`);

        // Assign first user to first advisor
        const firstAdvisor = await Person.findOne({ role: 'advisor' });
        if (users.length > 0 && firstAdvisor) {
            await Person.findByIdAndUpdate(users[0]._id, {
                assignedAdvisor: firstAdvisor._id
            });
            console.log(`✅ Assigned "${users[0].name}" to advisor "${firstAdvisor.name}"`);

            // Clear assignment for other users so they can test the request flow
            for (let i = 1; i < users.length; i++) {
                await Person.findByIdAndUpdate(users[i]._id, {
                    assignedAdvisor: null
                });
                console.log(`  ✓ Cleared assignment for ${users[i].name} (can send requests)`);
            }
        }

        // Check pending requests
        const pendingRequests = await AdvisorRequest.find({ status: 'pending' })
            .populate('user', 'name')
            .populate('advisor', 'name');
        console.log(`\n📨 Pending Requests: ${pendingRequests.length}`);
        pendingRequests.forEach(r => console.log(`  - ${r.user?.name} -> ${r.advisor?.name}`));

        console.log('\n✅ Setup complete!\n');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

setup();
