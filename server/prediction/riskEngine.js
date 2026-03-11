/**
 * Calculates flood risk based on weather parameters.
 * 
 * Formula:
 * riskScore = (rainfall * 0.4) + (windSpeed * 0.2) + (humidity * 0.1) + (pressureDrop * 0.3)
 * 
 * Risk Levels:
 * 0 - 30 -> Low
 * 30 - 60 -> Medium
 * 60 - 80 -> High
 * 80 - 100 -> Extreme
 */

const calculateRisk = (weatherData) => {
  const rainfall = weatherData.current.precip_mm || 0;
  const windSpeed = weatherData.current.wind_kph || 0;
  const humidity = weatherData.current.humidity || 0;
  
  // Simple pressure drop calculation (using current pressure as a proxy for risk level if not historical)
  // For this exercise, we'll use (1013 - pressure) * 10 to simulate a drop
  const pressure = weatherData.current.pressure_mb || 1013;
  const pressureDrop = Math.max(0, 1013 - pressure) * 2; 

  let riskScore = (rainfall * 0.4) + (windSpeed * 0.2) + (humidity * 0.1) + (pressureDrop * 0.3);
  
  // Normalize score to 0-100
  riskScore = Math.min(100, Math.max(0, riskScore)).toFixed(1);

  let riskLevel = 'Low';
  if (riskScore > 80) riskLevel = 'Extreme';
  else if (riskScore > 60) riskLevel = 'High';
  else if (riskScore > 30) riskLevel = 'Medium';

  return {
    score: parseFloat(riskScore),
    level: riskLevel
  };
};

const calculateRiskFromDay = (dayData) => {
  const rainfall = dayData.day.totalprecip_mm || 0;
  const windSpeed = dayData.day.maxwind_kph || 0;
  const humidity = dayData.day.avghumidity || 0;
  
  // Proxy for pressure drop in forecast (using wind as extra weight if needed)
  const pressureDrop = windSpeed > 40 ? 30 : 10; 

  let riskScore = (rainfall * 0.4) + (windSpeed * 0.2) + (humidity * 0.1) + (pressureDrop * 0.3);
  riskScore = Math.min(100, Math.max(0, riskScore)).toFixed(1);

  let riskLevel = 'Low';
  if (riskScore > 80) riskLevel = 'Extreme';
  else if (riskScore > 60) riskLevel = 'High';
  else if (riskScore > 30) riskLevel = 'Medium';

  return {
    score: parseFloat(riskScore),
    level: riskLevel
  };
};

module.exports = { calculateRisk, calculateRiskFromDay };
