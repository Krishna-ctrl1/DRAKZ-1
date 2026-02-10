const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db.config');

const AdminLog = require('./src/models/adminLog.model');
const Person = require('./src/models/people.model'); 
const Kyc = require('./src/models/kyc.model');
const Blog = require('./src/models/blog.model');
const Contact = require('./src/models/ContactModel'); // Check if this file exists as ContactModel.js

const run = async () => {
    await connectDB();
    
    try {
        console.log('--- Database Verification ---');
        
        const logsCount = await AdminLog.countDocuments();
        console.log(`Admin Logs: ${logsCount}`);
        
        const adminsCount = await Person.countDocuments({ role: 'admin' });
        console.log(`Admins: ${adminsCount}`);
        
        const adminUser = await Person.findOne({ email: 'admin@drakz.com' });
        if (adminUser) {
            console.log('Admin User Found:', JSON.stringify(adminUser, null, 2));
        } else {
            console.log('Admin User NOT FOUND with email admin@drakz.com');
        }
        
        const kycCount = await Kyc.countDocuments();
        console.log(`KYC Requests: ${kycCount}`);

        const blogCount = await Blog.countDocuments();
        console.log(`Blogs (Content): ${blogCount}`);
        if(blogCount > 0) {
            const blogs = await Blog.find({});
            console.log('Sample Blog:', JSON.stringify(blogs[0], null, 2));
        }

        const ticketCount = await Contact.countDocuments();
        console.log(`Support Tickets (Contact): ${ticketCount}`);
        if(ticketCount > 0) {
            const tickets = await Contact.find({});
            console.log('Sample Ticket:', JSON.stringify(tickets[0], null, 2));
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
