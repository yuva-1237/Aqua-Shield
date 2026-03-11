const express = require('express');
const router = express.Router();
const floodRisk = require('../analytics/floodRiskAnalytics');
const climateRisk = require('../analytics/climateRiskAnalytics');
const aquaticHealth = require('../analytics/aquaticHealthAnalytics');
const { processAlerts } = require('../analytics/alertEngine');
const weatherService = require('../services/weatherService');

router.get('/analyze-all', async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City required' });

    try {
        const data = await weatherService.fetchWeather(city);
        
        const flood = floodRisk.analyzeFloodRisk({
            rainfall: data.current.precip_mm,
            windSpeed: data.current.wind_kph,
            pressure: data.current.pressure_mb,
            seaLevel: 1.5, // Logic can be more complex
            city
        });

        const climate = climateRisk.analyzeClimateRisk({
            tempAnomaly: data.current.temp_c - 24,
            rainfallChange: data.current.precip_mm,
            heatwaveRisk: data.current.temp_c > 35 ? 80 : 20,
            droughtRisk: data.current.humidity < 30 ? 70 : 15,
            city
        });

        const aquatic = aquaticHealth.analyzeAquaticHealth({
            oceanTemp: data.current.temp_c,
            pollutionIndex: 40,
            coralStress: data.current.temp_c > 30 ? 70 : 10,
            oxygenDrop: 15,
            city
        });

        // Trigger Alerts with Context
        const context = {
            precip: data.current.precip_mm,
            wind: data.current.wind_kph,
            pressure: data.current.pressure_mb,
            currentTemp: data.current.temp_c,
            tempAnomaly: climate.details ? climate.details.tempAnomaly : 0.5,
            slrPotential: flood.details ? flood.details.seaLevelRise : 1.5
        };

        const floodAlerts = processAlerts('flood', city, flood.score, context);
        const climateAlerts = processAlerts('climate', city, climate.score, context);
        const aquaticAlerts = processAlerts('aquatic', city, aquatic.score, context);
        const allAlerts = [...floodAlerts, ...climateAlerts, ...aquaticAlerts];

        res.json({
            city: data.location.name,
            lat: data.location.lat,
            lon: data.location.lon,
            flood,
            climate,
            aquatic,
            alerts: allAlerts,
            weather: data.current
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
