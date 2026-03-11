const axios = require('axios');

const CLIMATE_API_KEY = 'cd29e44362584bcb8e683430261003';
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

const fetchClimateData = async (city) => {
    try {
        const response = await axios.get(`${BASE_URL}?key=${CLIMATE_API_KEY}&q=${city}&days=3&aqi=no&alerts=no`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching climate data for ${city}:`, error.message);
        throw new Error('Could not fetch climate data.');
    }
};

module.exports = { fetchClimateData };
