const axios = require('axios');

async function testEndpoints() {
    const city = 'Miami';
    const baseUrl = 'http://localhost:3000/api';
    
    const endpoints = [
        `/climate-risk?city=${city}`,
        `/aquatic-risk?city=${city}`,
        `/sea-level-projection`,
        `/flood-risk?city=${city}`
    ];

    for (const ep of endpoints) {
        try {
            const res = await axios.get(baseUrl + ep);
            console.log(`PASS: ${ep}`);
            console.log('Type:', typeof res.data);
            if (typeof res.data === 'string' && res.data.startsWith('<!DOCTYPE')) {
                console.log('FAIL: Endpoint returned HTML');
            }
        } catch (err) {
            console.log(`FAIL: ${ep} - ${err.message}`);
        }
    }
}

testEndpoints();
