/**
 * Sea Level Rise Prediction Module (2026 - 2050)
 */
const getProjections = (currentSeaLevel = 0) => {
    const years = [2026, 2027, 2028, 2029, 2030, 2035, 2040, 2045, 2050];
    const yearlyIncreaseRate = 3.5; // mm per year (aggressive scenario)
    
    return years.map(year => {
        const yearsAhead = year - 2025;
        const increase = parseFloat((yearlyIncreaseRate * yearsAhead).toFixed(2));
        const floodProb = Math.min(100, yearsAhead * 2.5).toFixed(1);
        const landLoss = (yearsAhead * 0.05).toFixed(2);
        
        return {
            year,
            increase,
            floodProbability: parseFloat(floodProb),
            landLossPercentage: parseFloat(landLoss)
        };
    });
};

module.exports = { getProjections };
