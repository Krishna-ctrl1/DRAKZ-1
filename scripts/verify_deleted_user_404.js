const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3001/api';
const Person = require('../src/models/people.model');
const { jwtSecret } = require('../src/config/jwt.config');

const verifyDeletedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // 1. Create a temporary user directly in DB
        const tempUser = await Person.create({
            name: "Temp User",
            email: `temp_${Date.now()}@drakz.com`,
            password: "hashed_dummy_password",
            role: "user"
        });
        console.log(`✅ Created temp user: ${tempUser.email} (ID: ${tempUser._id})`);

        // 2. Generate a valid JWT for this user manually (to skip login flow details)
        const payload = {
            id: tempUser._id,
            role: tempUser.role
        };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        console.log('✅ Generated valid JWT token for temp user.');

        // 3. Delete the user from DB
        await Person.findByIdAndDelete(tempUser._id);
        console.log('✅ Deleted temp user from DB.');

        // 4. Try to access profile with the token
        console.log('🔄 Attempting to fetch profile with orphaned token...');
        try {
            await axios.get(`${API_URL}/settings/profile`, {
                headers: { 'x-auth-token': token }
            });
            console.log('❌ Unexpected success: Profile fetched for deleted user!');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Success: Received 404 Not Found as expected.');
                console.log('Response msg:', error.response.data.msg);
            } else {
                console.log('❌ Unexpected error:', error.message);
                if (error.response) console.log('Status:', error.response.status);
            }
        }

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyDeletedUser();
