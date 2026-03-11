/**
 * Tsunami Early Warning Analytics Engine
 */

const analyzeTsunamiRisk = (seismicData) => {
    // simplified model based on magnitude and distance from coast
    const magnitude = seismicData.magnitude || 5.0;
    const depth = seismicData.depth || 10; // km
    const distToCoast = seismicData.distanceToCoast || 100; // km

    const baseRisk = (magnitude ** 2) / (depth * 0.5);
    const score = Math.min(100, Math.max(0, (baseRisk * 10) - (distToCoast * 0.2)));

    let category = 'No Threat';
    if (score > 80) category = 'SEVERE / IMMEDIATE ACTION';
    else if (score > 60) category = 'WARNING / EVACUATE COAST';
    else if (score > 30) category = 'WATCH / MONITORING';

    return {
        score: Math.round(score),
        category,
        details: {
            originMagnitude: magnitude,
            estimatedTravelTime: Math.max(5, Math.round(distToCoast / 10)), // simple minutes calc
            waveHeightProj: (magnitude * 0.5).toFixed(1) + 'm'
        }
    };
};

module.exports = { analyzeTsunamiRisk };
