/**
 * Marine Traffic Risk Agent
 * Predicts safer routes for vessels during storms or high waves
 */
const MarineTrafficAgent = {
    name: "Marine Traffic Risk Agent",
    id: "agent_traffic",
    icon: "🚢",
    
    analyze: (data) => {
        const alerts = [];
        const { wind, score, city } = data;

        if (wind > 40 || score > 60) {
            alerts.push({
                agent: MarineTrafficAgent.name,
                icon: MarineTrafficAgent.icon,
                type: "Navigation Reroute",
                message: `Dangerous wave patterns near ${city}. Recommend rerouting cargo traffic 50nm offshore.`,
                severity: "WARNING"
            });
        }
        
        if (wind > 80) {
            alerts.push({
                agent: MarineTrafficAgent.name,
                icon: MarineTrafficAgent.icon,
                type: "Port Closure Advisory",
                message: `Extreme maritime risk in ${city} sector. Recommend immediate port closure and anchoring in deep water.`,
                severity: "CRITICAL"
            });
        }

        return alerts;
    }
};

module.exports = MarineTrafficAgent;
