const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db.config');
const AdminLog = require('./src/models/adminLog.model');
const Person = require('./src/models/people.model');

const run = async () => {
    await connectDB();
    console.log('Connected to DB');

    try {
        const admin = await Person.findOne({ role: 'admin' });
        if (!admin) {
            console.error('No admin found to test logging');
            return;
        }

        console.log('Testing AdminLog creation for admin:', admin._id);

        const newLog = await AdminLog.create({
            adminId: admin._id,
            adminName: admin.name || 'Test Admin',
            action: 'TEST_LOG',
            targetId: 'TEST_TARGET',
            details: 'Manual test log entry',
            ipAddress: '127.0.0.1'
        });

        console.log('Log created successfully:', newLog);

        const count = await AdminLog.countDocuments();
        console.log('Total Logs in DB:', count);

    } catch (error) {
        console.error('Logging failed:', error);
        console.error('Error Details:', JSON.stringify(error, null, 2));
    } finally {
        await mongoose.connection.close();
    }
};

run();
