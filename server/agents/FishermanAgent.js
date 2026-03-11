/**
 * Fisherman Safety Agent
 * Monitors maritime conditions for small-scale fishing operations.
 */
class FishermanAgent {
    constructor() {
        this.name = 'Fisherman Safety Agent';
        this.id = 'agent_fisherman';
        this.icon = '🚤';
    }

    analyze(data) {
        const { city, wind, precip, pressure } = data;
        const alerts = [];

        // In a real scenario, we'd have wave_height. Here we derive it from wind/pressure
        const waveHeight = wind * 0.08 + (1013 - pressure) * 0.05;

        if (waveHeight > 2.5) {
            alerts.push({
                agent: this.name,
                type: 'Maritime Hazard',
                message: `🔴 High wave intensity (${waveHeight.toFixed(1)}m) near ${city}. Unsafe for small fishing vessels.`,
                severity: 'CRITICAL',
                icon: this.icon
            });
        } else if (wind > 40) {
            alerts.push({
                agent: this.name,
                type: 'Wind Warning',
                message: `⚠️ Strong offshore winds (${wind} kph) in ${city}. Risk of being swept to deep waters.`,
                severity: 'WARNING',
                icon: this.icon
            });
        }

        if (precip > 10) {
            alerts.push({
                agent: this.name,
                type: 'Visibility Alert',
                message: `🌧️ Heavy rain reduces visibility in ${city} coastal regions. Use extreme caution.`,
                severity: 'WARNING',
                icon: this.icon
            });
        }

        return alerts;
    }
}

module.exports = new FishermanAgent();
