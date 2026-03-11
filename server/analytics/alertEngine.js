const db = require('../database/environmentalData');

// Import AI Agents
const fishermanAgent = require('../agents/FishermanAgent');
const aviationAgent = require('../agents/AviationAgent');
const ecosystemAgent = require('../agents/EcosystemAgent');
const floodAgent = require('../agents/FloodAgent');
const climateAgent = require('../agents/ClimateAgent');
const newsAgent = require('../agents/NewsAgent');

// Phase 4 Specialized Agents
const marineTrafficAgent = require('../agents/MarineTrafficAgent');
const droneAgent = require('../agents/DroneSurveillanceAgent');
const decisionAgent = require('../agents/DecisionAgent');
const seasonalAgent = require('../agents/SeasonalAgent');

let wsServer = null;

const initAlertEngine = (wss) => {
    wsServer = wss;
};

const processAlerts = (domain, city, score, context = {}) => {
    let allAgentAlerts = [];
    
    // Prepare data packet for agents
    const dataPacket = {
        city,
        wind: context.wind || 15,
        precip: context.precip || 0,
        pressure: context.pressure || 1013,
        tempAnomaly: context.tempAnomaly || 0.5,
        currentTemp: context.currentTemp || 25,
        aquaticScore: domain === 'aquatic' ? score : 30,
        slrPotential: context.slrPotential || 5,
        drainageScore: context.drainageScore || 60
    };

    // Orchestrate Agents
    if (domain === 'flood' || domain === 'weather') {
        allAgentAlerts = allAgentAlerts.concat(fishermanAgent.analyze(dataPacket));
        allAgentAlerts = allAgentAlerts.concat(aviationAgent.analyze(dataPacket));
        allAgentAlerts = allAgentAlerts.concat(floodAgent.analyze(dataPacket));
        
        // Phase 4 Expansion
        allAgentAlerts = allAgentAlerts.concat(marineTrafficAgent.analyze(dataPacket));
        allAgentAlerts = allAgentAlerts.concat(droneAgent.analyze(dataPacket));
        allAgentAlerts = allAgentAlerts.concat(decisionAgent.analyze(dataPacket));
        allAgentAlerts = allAgentAlerts.concat(seasonalAgent.analyze(dataPacket));
    }
    
    if (domain === 'aquatic') {
        allAgentAlerts = allAgentAlerts.concat(ecosystemAgent.analyze(dataPacket));
    }

    if (domain === 'climate') {
        allAgentAlerts = allAgentAlerts.concat(climateAgent.analyze(dataPacket));
    }

    // Intelligence push to WebSocket
    if (wsServer && allAgentAlerts.length > 0) {
        const payload = JSON.stringify({ type: 'AGENT_INTEL', data: allAgentAlerts });
        wsServer.clients.forEach(client => {
            if (client.readyState === 1) client.send(payload);
        });
    }

    // Log to DB
    allAgentAlerts.forEach(a => {
        try { db.saveData('alerts', { ...a, city, timestamp: new Date().toISOString() }); } catch(e) {}
    });
    
    return allAgentAlerts;
};

module.exports = { initAlertEngine, processAlerts };
