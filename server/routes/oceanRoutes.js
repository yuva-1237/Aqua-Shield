const express = require('express');
const router = express.Router();
const oceanService = require('../services/oceanService');
const aquaticRiskEngine = require('../prediction/aquaticRiskEngine');
const seaLevelPrediction = require('../prediction/seaLevelPrediction');

router.get('/aquatic-risk', async (req, res) => {
    const city = req.query.city;
    try {
        const data = await oceanService.fetchOceanMetrics(city);
        const risk = aquaticRiskEngine.calculateAquaticRisk({
            oceanTemp: data.current.temp_c,
            pollutionIndex: 45, // Demo constant
            coralStress: data.current.temp_c > 30 ? 75 : 20,
            oxygenDrop: 15
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

router.get('/sea-level-projection', async (req, res) => {
    const projections = seaLevelPrediction.getProjections(0);
    res.json(projections);
});

module.exports = router;
