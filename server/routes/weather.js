const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const floodRiskEngine = require('../prediction/floodRiskEngine');

router.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City required' });

    try {
        const data = await weatherService.fetchWeather(city);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/flood-risk', async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City required' });

    try {
        const data = await weatherService.fetchWeather(city);
        const risk = floodRiskEngine.calculateFloodRisk({
            rainfall: data.current.precip_mm,
            windSpeed: data.current.wind_kph,
            pressure: data.current.pressure_mb,
            tidalHeight: 1.5 // Demo value for coastal regions
        });
        res.json({ 
            city: data.location.name, 
            lat: data.location.lat,
            lon: data.location.lon,
            ...risk 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
