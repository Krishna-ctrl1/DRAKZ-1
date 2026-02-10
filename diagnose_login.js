const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/db.config');
const authController = require('./src/controllers/auth.controller');

// Mock Req/Res
const mockReq = {
    body: {
        email: 'admin@drakz.com',
        password: '123456'
    },
    connection: { remoteAddress: '127.0.0.1' }
};

const mockRes = {
    json: (data) => console.log('JSON Response:', data),
    status: (code) => {
        console.log('Status Code:', code);
        return mockRes;
    },
    send: (msg) => console.log('Send Response:', msg)
};

const run = async () => {
    await connectDB();
    console.log('--- Diagnosing Login ---');
    try {
        await authController.login(mockReq, mockRes);
    } catch (error) {
        console.error('FATAL ERROR CAUGHT IN SCRIPT:', error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
