const axios = require('axios');

const WEATHER_API_KEY = 'cd29e44362584bcb8e683430261003';
const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

const fetchWeather = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}?key=${WEATHER_API_KEY}&q=${city}&days=3&aqi=no&alerts=no`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error.message);
    throw new Error('Could not fetch weather data. Please try again later.');
  }
};

module.exports = { fetchWeather };
