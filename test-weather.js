const weatherService = require('./server/services/weatherService');

async function test() {
    try {
        const data = await weatherService.fetchWeather('Chennai');
        console.log('Weather Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
