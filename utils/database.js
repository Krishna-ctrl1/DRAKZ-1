const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Database already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drakz', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
