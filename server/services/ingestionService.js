const { processAlerts } = require('../analytics/alertEngine');
const weatherService = require('./weatherService');
const { initDB, saveData } = require('../database/environmentalData');

let ingestionInterval = null;

const startIngestion = (cities = ['Miami', 'Manila', 'London', 'Chennai']) => {
    initDB();
    
    ingestionInterval = setInterval(async () => {
        console.log('--- BACKGROUND AGENT MONITORING START ---');
        for (const city of cities) {
            try {
                const data = await weatherService.fetchWeather(city);
                
                // Trigger AI Agents for this city in the background
                processAlerts('flood', city, 50, {
                    precip: data.current.precip_mm,
                    wind: data.current.wind_kph,
                    pressure: data.current.pressure_mb,
                    currentTemp: data.current.temp_c
                });

                saveData('history', {
                    city,
                    temp: data.current.temp_c,
                    precip: data.current.precip_mm,
                    wind: data.current.wind_kph,
                    type: 'auto_ingest'
                });
            } catch (err) {
                console.error(`Background monitoring error for ${city}:`, err.message);
            }
        }
    }, 5 * 60 * 1000);
};

module.exports = { startIngestion };
