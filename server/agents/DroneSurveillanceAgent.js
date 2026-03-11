/**
 * Drone Surveillance Agent
 * Recommends optimal deployment zones for environmental monitoring drones
 */
const DroneSurveillanceAgent = {
    name: "Drone Surveillance Agent",
    id: "agent_drone",
    icon: "🚁",
    
    analyze: (data) => {
        const alerts = [];
        const { precip, slrPotential, city } = data;

        if (precip > 50 || slrPotential > 10) {
            alerts.push({
                agent: DroneSurveillanceAgent.name,
                icon: DroneSurveillanceAgent.icon,
                type: "Drone Deployment Alert",
                message: `High runoff risk in ${city}. Recommend drone monitoring of drainage basins and coastal barriers.`,
                severity: "INFO"
            });
        }
        
        if (data.isOilSpill) {
             alerts.push({
                agent: DroneSurveillanceAgent.name,
                icon: DroneSurveillanceAgent.icon,
                type: "Pollution Tracking",
                message: `Oil spill detected. Deploying thermal imaging drones for slick perimeter containment mapping.`,
                severity: "WARNING"
            });
        }

        return alerts;
    }
};

module.exports = DroneSurveillanceAgent;
