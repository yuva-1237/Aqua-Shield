/**
 * Aquatic Ecosystem Risk Engine
 */
const calculateAquaticRisk = (data) => {
    const { oceanTemp, pollutionIndex, coralStress, oxygenDrop } = data;
    
    // Formula: (oceanTemp * 0.35) + (pollutionIndex * 0.30) + (coralStress * 0.20) + (oxygenDrop * 0.15)
    // Assuming inputs are normalized or relative impact scores
    let score = (oceanTemp * 0.35) + (pollutionIndex * 0.30) + (coralStress * 0.20) + (oxygenDrop * 0.15);
    
    score = Math.min(100, Math.max(0, score));
    
    let category = 'Healthy';
    if (score > 80) category = 'Critical Ecosystem Damage';
    else if (score > 60) category = 'High Stress';
    else if (score > 30) category = 'Moderate Stress';
    
    return { score: parseFloat(score.toFixed(1)), category };
};

module.exports = { calculateAquaticRisk };
