const express = require('express');
const router = express.Router();
const seaLevel = require('../analytics/seaLevelAnalytics');

router.get('/projections', async (req, res) => {
    try {
        const city = req.query.city || "Global";
        const projections = await seaLevel.getFutureProjections(city);
        res.json(projections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
