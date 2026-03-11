/**
 * Flood Prediction Agent
 * Predicts coastal and inland flooding risks.
 */
class FloodAgent {
    constructor() {
        this.name = 'Flood Prediction Agent';
        this.id = 'agent_flood';
        this.icon = '🌊';
    }

    analyze(data) {
        const { city, precip, slrPotential, drainageScore = 50 } = data;
        const alerts = [];

        // Flood probability calculation
        const floodProb = (precip * 3.5) + (slrPotential * 2.0) + (100 - drainageScore) * 0.2;

        if (floodProb > 85) {
            alerts.push({
                agent: this.name,
                type: 'Immediate Flood Risk',
                message: `📢 CRITICAL: High likelihood (${floodProb.toFixed(0)}%) of flash flooding in ${city}. Evacuate low-lying zones.`,
                severity: 'CRITICAL',
                icon: this.icon
            });
        } else if (floodProb > 60) {
            alerts.push({
                agent: this.name,
                type: 'Flood Warning',
                message: `🔴 Moderate to high flood risk in ${city}. Prepare for potential coastal inundation.`,
                severity: 'WARNING',
                icon: this.icon
            });
        } else if (floodProb > 30) {
             alerts.push({
                agent: this.name,
                type: 'Flood Advisory',
                message: `⚠️ Minor localized flooding possible in ${city} due to sustained precipitation.`,
                severity: 'INFO',
                icon: '🌧️'
            });
        }

        return alerts;
    }
}

module.exports = new FloodAgent();
