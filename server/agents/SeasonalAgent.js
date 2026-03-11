/**
 * Seasonal Forecast Agent
 * Predicts monsoon intensity and long-term coastal flooding patterns for the year
 */
const SeasonalAgent = {
    name: "Seasonal Forecast Agent",
    id: "agent_seasonal",
    icon: "📅",
    
    analyze: (data) => {
        const alerts = [];
        const { currentTemp, pressure, city } = data;
        const month = new Date().getMonth(); // 0-11

        // Mock Monsoon logic (highly active Jun-Sep)
        const isMonsoonSeason = month >= 5 && month <= 8;

        if (isMonsoonSeason) {
            if (pressure < 1005) {
                alerts.push({
                    agent: SeasonalAgent.name,
                    icon: SeasonalAgent.icon,
                    type: "Severe Monsoon Outlook",
                    message: `Depression formed in the sector. Expect 20% higher precipitation than seasonal averages for ${city}.`,
                    severity: "WARNING"
                });
            } else {
                alerts.push({
                    agent: SeasonalAgent.name,
                    icon: SeasonalAgent.icon,
                    type: "Seasonal Update",
                    message: `Active monsoon conditions continuing for ${city}. Ground saturation is high.`,
                    severity: "INFO"
                });
            }
        } else if (month >= 11 || month <= 1) {
            // Winter logic
            alerts.push({
                agent: SeasonalAgent.name,
                icon: SeasonalAgent.icon,
                type: "Winter Cyclone Watch",
                message: `Cooler sea-surface temperatures in ${city} region reducing cyclone probability for this quarter.`,
                severity: "INFO"
            });
        }

        return alerts;
    }
};

module.exports = SeasonalAgent;
