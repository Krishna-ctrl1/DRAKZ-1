require('dotenv').config();
const mongoose = require('mongoose');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to Database Name: ${mongoose.connection.name}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDB();
