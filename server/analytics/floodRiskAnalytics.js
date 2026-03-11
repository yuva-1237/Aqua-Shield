/**
 * Flood Risk Analytics
 */
const db = require('../database/environmentalData');

const analyzeFloodRisk = (data) => {
    const { rainfall, windSpeed, pressure, seaLevel, city } = data;
    const pressureDrop = Math.max(0, 1013 - pressure);
    
    let score = (rainfall * 0.35) + (windSpeed * 0.25) + (pressureDrop * 0.20) + (seaLevel * 0.20);
    score = Math.min(100, Math.max(0, score));

    let category = 'Low';
    if (score > 80) category = 'Extreme';
    else if (score > 60) category = 'High';
    else if (score > 30) category = 'Moderate';

    const result = { 
        score: parseFloat(score.toFixed(1)), 
        category,
        details: {
            seaLevelRise: 1.5 // Standard baseline for analysis
        }
    };
    try { db.saveData('history', { type: 'flood', score: result.score, category, city }); } catch(e) {}
    return result;
};

module.exports = { analyzeFloodRisk };
