const axios = require('axios');

const OCEAN_API_KEY = 'cd29e44362584bcb8e683430261003';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

const fetchOceanMetrics = async (city) => {
    try {
        // Using WeatherAPI as a proxy for coastal environmental metrics
        const response = await axios.get(`${BASE_URL}?key=${OCEAN_API_KEY}&q=${city}&aqi=no`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ocean metrics for ${city}:`, error.message);
        throw new Error('Could not fetch ocean metrics.');
    }
};

module.exports = { fetchOceanMetrics };
