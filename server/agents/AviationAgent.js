/**
 * Aircraft Weather Agent
 * Monitors atmospheric conditions for aviation safety.
 */
class AviationAgent {
    constructor() {
        this.name = 'Aircraft Weather Agent';
        this.id = 'agent_aviation';
        this.icon = '✈️';
    }

    analyze(data) {
        const { city, wind, tempAnomaly, precip } = data;
        const alerts = [];

        if (tempAnomaly > 2.0) {
            alerts.push({
                agent: this.name,
                type: 'Severe Turbulence',
                message: `🌪️ Extreme thermal anomaly (${tempAnomaly}°C) detected in ${city}. Severe turbulence in lower flight levels.`,
                severity: 'CRITICAL',
                icon: this.icon
            });
        }

        if (wind > 80) {
            alerts.push({
                agent: this.name,
                type: 'High Wind Shear',
                message: `💨 Gale-force winds (${wind} kph) detected near ${city}. Significant wind shear hazard for approach.`,
                severity: 'CRITICAL',
                icon: this.icon
            });
        } else if (wind > 50) {
             alerts.push({
                agent: this.name,
                type: 'Turbulence Advisory',
                message: `⚠️ Moderate turbulence levels reported in ${city} airspace due to gusty conditions.`,
                severity: 'WARNING',
                icon: this.icon
            });
        }

        if (precip > 20) {
            alerts.push({
                agent: this.name,
                type: 'Storm Tracking',
                message: `⛈️ Active storm cell over ${city}. Lightning risk and poor terminal visibility.`,
                severity: 'WARNING',
                icon: this.icon
            });
        }

        return alerts;
    }
}

module.exports = new AviationAgent();
