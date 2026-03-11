/**
 * Advanced Coastal Flood Risk Engine
 */
const calculateFloodRisk = (data) => {
    const { rainfall, windSpeed, pressure, tidalHeight } = data;
    
    // Standard pressure is 1013mb. Pressure drop increases risk.
    const pressureDrop = Math.max(0, 1013 - pressure);
    
    // Formula: (rainfall * 0.35) + (windSpeed * 0.20) + (pressureDrop * 0.25) + (tidalHeight * 0.20)
    let score = (rainfall * 0.35) + (windSpeed * 0.20) + (pressureDrop * 0.25) + (tidalHeight * 0.20);
    
    // Normalize to 0-100
    score = Math.min(100, Math.max(0, score)).toFixed(1);
    
    let level = 'Low';
    if (score > 80) level = 'Extreme';
    else if (score > 60) level = 'High';
    else if (score > 30) level = 'Moderate';
    
    return { score: parseFloat(score), level };
};

module.exports = { calculateFloodRisk };
