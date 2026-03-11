/**
 * Inland Climate Risk Engine
 */
const calculateClimateRisk = (data) => {
    const { tempAnomaly, rainfallChange, heatwaveRisk, droughtRisk } = data;
    
    // Formula: (tempAnomaly * 0.40) + (rainfallChange * 0.25) + (heatwaveRisk * 0.20) + (droughtRisk * 0.15)
    let index = (tempAnomaly * 0.40) + (rainfallChange * 0.25) + (heatwaveRisk * 0.20) + (droughtRisk * 0.15);
    
    index = Math.min(100, Math.max(0, index));
    
    let category = 'Low';
    if (index > 75) category = 'Critical';
    else if (index > 50) category = 'High';
    else if (index > 25) category = 'Moderate';
    
    return { index: parseFloat(index.toFixed(1)), category };
};

module.exports = { calculateClimateRisk };
