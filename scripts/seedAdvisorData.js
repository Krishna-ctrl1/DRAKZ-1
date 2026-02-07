/**
 * Seed script to populate advisor profile data for testing
 * Run with: node scripts/seedAdvisorData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db.config.js');

// Connect to database
connectDB();

const Person = require('../src/models/people.model.js');

const advisorProfiles = [
    {
        price: 2500,
        certificate: 'CFP (Certified Financial Planner)',
        specialization: 'Retirement Planning',
        bio: 'Expert in retirement planning with 10+ years of experience helping clients achieve their financial goals.',
        contactEmail: 'advisor1@drakz.com',
        contactPhone: '+91 98765 43210',
        experience: 10,
        isAcceptingClients: true
    },
    {
        price: 3000,
        certificate: 'CFA (Chartered Financial Analyst)',
        specialization: 'Investment Management',
        bio: 'Specializing in portfolio optimization and wealth management for high net-worth individuals.',
        contactEmail: 'advisor2@drakz.com',
        contactPhone: '+91 98765 43211',
        experience: 8,
        isAcceptingClients: true
    },
    {
        price: 2000,
        certificate: 'SEBI Registered Investment Advisor',
        specialization: 'Tax Planning',
        bio: 'Helping clients minimize tax liability while maximizing returns through strategic planning.',
        contactEmail: 'advisor3@drakz.com',
        contactPhone: '+91 98765 43212',
        experience: 5,
        isAcceptingClients: true
    }
];

async function seedAdvisorData() {
    try {
        // Find all advisors
        const advisors = await Person.find({ role: 'advisor' });

        if (advisors.length === 0) {
            console.log('❌ No advisors found in database. Creating sample advisor...');

            // Create a sample advisor
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('advisor123', 10);

            const newAdvisor = new Person({
                name: 'Demo Advisor',
                email: 'advisor@drakz.com',
                password: hashedPassword,
                role: 'advisor',
                advisorProfile: advisorProfiles[0]
            });

            await newAdvisor.save();
            console.log('✅ Created demo advisor: advisor@drakz.com / advisor123');

        } else {
            console.log(`Found ${advisors.length} advisors. Updating profiles...`);

            // Update each advisor with profile data
            for (let i = 0; i < advisors.length; i++) {
                const advisor = advisors[i];
                const profileData = advisorProfiles[i % advisorProfiles.length];

                await Person.findByIdAndUpdate(advisor._id, {
                    advisorProfile: {
                        ...profileData,
                        contactEmail: profileData.contactEmail || advisor.email
                    }
                });

                console.log(`✅ Updated advisor: ${advisor.name} (${advisor.email})`);
            }
        }

        console.log('\n🎉 Advisor data seeding complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding advisor data:', err);
        process.exit(1);
    }
}

// Run the seed function
seedAdvisorData();
