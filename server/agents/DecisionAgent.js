/**
 * Decision Support Agent
 * Generates plain-language recommendations for disaster preparedness and safety
 */
const DecisionAgent = {
    name: "Decision Support Agent",
    id: "agent_decision",
    icon: "🧠",
    
    analyze: (data) => {
        const alerts = [];
        const { score, city } = data;

        if (score > 70) {
            alerts.push({
                agent: DecisionAgent.name,
                icon: DecisionAgent.icon,
                type: "Emergency Recommendation",
                message: `Evacuation of flood zone A in ${city} is strongly advised within the next 4 hours.`,
                severity: "CRITICAL"
            });
        } else if (score > 40) {
            alerts.push({
                agent: DecisionAgent.name,
                icon: DecisionAgent.icon,
                type: "Preparedness Advisory",
                message: `Stockpiling clean water and securing coastal properties in ${city} is recommended.`,
                severity: "WARNING"
            });
        }

        return alerts;
    }
};

module.exports = DecisionAgent;
