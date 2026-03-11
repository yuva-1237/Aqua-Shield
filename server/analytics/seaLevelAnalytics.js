/**
 * Sea Level Analytics Module
 */
const { exec } = require('child_process');
const path = require('path');

const getFutureProjections = (city = "Global") => {
    return new Promise((resolve, reject) => {
        // Calling Python ML script with city parameter for localization
        const scriptPath = path.join(__dirname, '../ml/time_series_forecast.py');
        exec(`python "${scriptPath}" "${city}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`ML Error: ${error}`);
                // Fallback to JS math if python fails
                return resolve(fallbackProjections(city));
            }
            try {
                const data = JSON.parse(stdout);
                resolve(data);
            } catch (e) {
                resolve(fallbackProjections());
            }
        });
    });
};

const fallbackProjections = (city = "Global") => {
    const results = [];
    for (let year = 2026; year <= 2050; year++) {
        const diff = year - 2025;
        results.push({ 
            year, 
            prediction: parseFloat((diff * 0.5).toFixed(2)),
            temp_anomaly: parseFloat((1.2 + (diff * 0.05)).toFixed(2))
        });
    }
    return results;
};

module.exports = { getFutureProjections };
