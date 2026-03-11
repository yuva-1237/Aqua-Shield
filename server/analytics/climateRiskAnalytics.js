/**
 * Climate Risk Analytics
 */
const db = require('../database/environmentalData');

const analyzeClimateRisk = (data) => {
    const { tempAnomaly, rainfallChange, heatwaveRisk, droughtRisk, city } = data;
    
    let score = (Math.abs(tempAnomaly) * 0.40) + (rainfallChange * 0.25) + (heatwaveRisk * 0.20) + (droughtRisk * 0.15);
    score = Math.min(100, Math.max(0, score));

    let category = 'Low';
    if (score > 75) category = 'Critical';
    else if (score > 50) category = 'High';
    else if (score > 25) category = 'Moderate';

    const result = {
        score: parseFloat(score.toFixed(1)),
        category,
        details: {
            tempAnomaly: parseFloat(tempAnomaly.toFixed(1))
        }
    };
    try { db.saveData('history', { type: 'climate', score: result.score, category, city }); } catch(e) {}
    return result;
};

module.exports = { analyzeClimateRisk };
