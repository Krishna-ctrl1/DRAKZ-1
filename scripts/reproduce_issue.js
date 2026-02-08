const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const reproduce = async () => {
    try {
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@drakz.com',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful. Token obtained.');

        console.log('🔄 Fetching settings profile...');
        const profileRes = await axios.get(`${API_URL}/settings/profile`, {
            headers: {
                'x-auth-token': token
            }
        });

        console.log('✅ Profile fetched successfully:');
        console.log(profileRes.data);

    } catch (error) {
        console.error('❌ Error reproducing issue:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

reproduce();
