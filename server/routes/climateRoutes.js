const express = require('express');
const router = express.Router();
const climateService = require('../services/climateService');
const climateRiskEngine = require('../prediction/climateRiskEngine');

router.get('/climate-risk', async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City required' });

    try {
        const data = await climateService.fetchClimateData(city);
        
        // Mocking anomaly data based on weather for demo purposes
        const risk = climateRiskEngine.calculateClimateRisk({
            tempAnomaly: (data.current.temp_c - 15) * 2, // Relative to a 15C baseline
            rainfallChange: Math.abs(data.current.precip_mm - 5) * 10,
            heatwaveRisk: data.current.temp_c > 35 ? 80 : 20,
            droughtRisk: data.current.humidity < 30 ? 70 : 15
        });

        res.json({
            city: data.location.name,
            lat: data.location.lat,
            lon: data.location.lon,
            riskIndex: risk.index,
            category: risk.category,
            details: {
                tempAnomaly: parseFloat(((data.current.temp_c - 15) * 2).toFixed(1)),
                precip: data.current.precip_mm,
                humidity: data.current.humidity
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
