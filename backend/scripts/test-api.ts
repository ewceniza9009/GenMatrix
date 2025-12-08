import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth';

const run = async () => {
    try {
        // Register
        console.log('Registering...');
        const regRes = await axios.post(`${API_URL}/register`, {
            username: 'root_ts',
            email: 'root_ts@test.com',
            password: 'password'
        });
        console.log('Register Res:', regRes.status, regRes.data);

        // Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'root_ts@test.com',
            password: 'password'
        });
        console.log('Login Res:', loginRes.status, loginRes.data);

    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message);
    }
};

run();
