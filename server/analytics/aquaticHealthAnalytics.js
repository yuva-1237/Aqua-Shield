/**
 * Aquatic Health Analytics
 */
const db = require('../database/environmentalData');

const analyzeAquaticHealth = (data) => {
    const { oceanTemp, pollutionIndex, coralStress, oxygenDrop, city } = data;
    
    let score = (oceanTemp * 0.35) + (pollutionIndex * 0.30) + (coralStress * 0.20) + (oxygenDrop * 0.15);
    score = Math.min(100, Math.max(0, score));

    let classification = 'Healthy Ecosystem';
    if (score > 80) classification = 'Ecosystem Collapse Risk';
    else if (score > 60) classification = 'High Risk';
    else if (score > 30) classification = 'Moderate Stress';

    const result = { score: parseFloat(score.toFixed(1)), classification };
    
    try { db.saveData('history', { type: 'aquatic', ...result, city }); } catch(e) {}
    
    return result;
};

module.exports = { analyzeAquaticHealth };
