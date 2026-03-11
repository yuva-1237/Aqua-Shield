/**
 * Coastal Ecosystem Agent
 * Monitors marine biodiversity and water health.
 */
class EcosystemAgent {
    constructor() {
        this.name = 'Coastal Ecosystem Agent';
        this.id = 'agent_ecosystem';
        this.icon = '🐢';
    }

    analyze(data) {
        const { city, currentTemp, tempAnomaly, aquaticScore } = data;
        const alerts = [];

        // Derive water temp (simplified simulation logic)
        const waterTemp = currentTemp - 2 + tempAnomaly;

        if (waterTemp > 31) {
            alerts.push({
                agent: this.name,
                type: 'Coral Stress',
                message: `🥀 CRITICAL: Water temperatures (${waterTemp.toFixed(1)}°C) in ${city} have reached bleaching thresholds.`,
                severity: 'CRITICAL',
                icon: '🪸'
            });
        } else if (waterTemp > 29) {
            alerts.push({
                agent: this.name,
                type: 'Thermal Stress',
                message: `⚠️ Rising marine temperatures in ${city}. Elevated stress on sensitive aquatic species.`,
                severity: 'WARNING',
                icon: '🌡️'
            });
        }

        if (aquaticScore > 60) {
            alerts.push({
                agent: this.name,
                type: 'Biodiversity Risk',
                message: `🐠 High stress on ${city} coastal ecosystem. Biodiversity indices are declining.`,
                severity: 'WARNING',
                icon: this.icon
            });
        }

        return alerts;
    }
}

module.exports = new EcosystemAgent();
