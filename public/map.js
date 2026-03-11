let map;
let marker;
let darkLayer, lightLayer;
let weatherLayers = {};
let simLayers = {};
let alertMarkers = [];
let tsunamiLayers = [];
let erosionLayer = null;
let safeZoneLayer = null;
let pollutionLayers = {};
let currentCoords = [20, 0];

function initMap() {
    if (map) return;
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
        fadeAnimation: true,
        markerZoomAnimation: true
    }).setView([20, 0], 2);

    // High-performance CARTO Dark Matter tiles
    darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        crossOrigin: true
    });

    lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        crossOrigin: true
    });

    darkLayer.addTo(map);
    
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
}

function updateMap(city, lat, lon, riskLevel) {
    if (!map) initMap();

    const locations = {
        'Manila': [14.5995, 120.9842],
        'Miami': [25.7617, -80.1918],
        'Chennai': [13.0827, 80.2707],
        'London': [51.5074, -0.1278],
        'New York': [40.7128, -74.0060],
        'Mumbai': [19.0760, 72.8777],
        'Jakarta': [-6.2088, 106.8456],
        'Bangkok': [13.7563, 100.5018],
        'Tokyo': [35.6762, 139.6503],
        'Sydney': [-33.8688, 151.2093],
        'Lagos': [6.5244, 3.3792],
        'Dhaka': [23.8103, 90.4125]
    };

    const coords = locations[city] || [parseFloat(lat), parseFloat(lon)];
    currentCoords = coords;

    if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
        console.warn(`Invalid coordinates for "${city}", keeping current map view.`);
        return;
    }

    map.flyTo(coords, 8, { animate: true, duration: 1.5 });

    if (marker) marker.remove();

    const color = riskLevel === 'Critical' ? '#ff0055' :
                  riskLevel === 'High'     ? '#ff8800' :
                  riskLevel === 'Moderate' ? '#ffdd00' : '#00ff88';

    marker = L.circleMarker(coords, {
        radius: 14,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
    }).addTo(map);

    marker.bindPopup(`<b>${city}</b><br>Climate Risk: <strong>${riskLevel}</strong>`).openPopup();

    // Ensure tiles render after flyTo animation
    setTimeout(() => { if (map) map.invalidateSize(); }, 1800);
}

// Initialized via main.js when dashboard is ready
window.refreshMap = () => { if (map) map.invalidateSize(); };

function setMapTheme(mode) {
    if (!map) return;
    if (mode === 'light') {
        map.removeLayer(darkLayer);
        lightLayer.addTo(map);
    } else {
        map.removeLayer(lightLayer);
        darkLayer.addTo(map);
    }
}

function updateWeatherLayer(layerType, visible) {
    if (!map) return;
    
    // In a real app, these would be WMS or Tile layers from a Weather API
    // For this simulation, we'll use colored overlays to represent the data layers
    const colors = {
        'wind': '#00f2ff',
        'temp': '#ff4d4d',
        'humidity': '#00ff88'
    };

    if (visible) {
        // Mock weather layer implementation
        const weatherGroup = L.layerGroup([]);
        // Add some random heat-map like circles for visualization
        for(let i=0; i<5; i++) {
            L.circle([20 + Math.random()*20, Math.random()*100], {
                color: colors[layerType],
                fillColor: colors[layerType],
                fillOpacity: 0.1,
                radius: 500000
            }).addTo(weatherGroup);
        }
        weatherLayers[layerType] = weatherGroup;
        weatherGroup.addTo(map);
    } else {
        if (weatherLayers[layerType]) {
            map.removeLayer(weatherLayers[layerType]);
            delete weatherLayers[layerType];
        }
    }
}

const COASTAL_REGIONS = {
    'Chennai': [
        [12.98, 80.24], [13.01, 80.25], [13.04, 80.26], [13.08, 80.27], [13.12, 80.29], [13.15, 80.30]
    ],
    'Mumbai': [
        [18.90, 72.80], [18.95, 72.82], [19.00, 72.83], [19.05, 72.85], [19.10, 72.88]
    ],
    'Miami': [
        [25.75, -80.20], [25.78, -80.15], [25.82, -80.12], [25.85, -80.14], [25.90, -80.13]
    ],
    'Manila': [
        [14.55, 120.95], [14.60, 120.98], [14.65, 120.97], [14.70, 120.99]
    ]
};

function getDistributedPoints(center, count, radiusKm) {
    const points = [];
    const degPerKm = 0.009; // Approx
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radiusKm * degPerKm;
        points.push([
            center[0] + Math.cos(angle) * dist,
            center[1] + Math.sin(angle) * dist
        ]);
    }
    return points;
}

function toggleClimateSim(type, visible) {
    if (!map) return;

    const layerColors = {
        'slr': '#0072ff',
        'flood': '#ff0055'
    };

    if (visible) {
        const simGroup = L.layerGroup([]);
        // Extract city from marker popup if possible
        let city = 'Global';
        if (marker && marker.getPopup()) {
             const match = marker.getPopup().getContent().match(/<b>(.*?)<\/b>/);
             if (match) city = match[1];
        }
        
        const basePoints = COASTAL_REGIONS[city] || getDistributedPoints(currentCoords, 5, 20);

        basePoints.forEach(p => {
            if (type === 'slr') {
                L.circle(p, {
                    color: layerColors.slr,
                    fillColor: layerColors.slr,
                    fillOpacity: 0.25,
                    radius: 12000,
                    weight: 1
                }).addTo(simGroup);
            } else {
                L.circle(p, {
                    color: layerColors.flood,
                    fillColor: layerColors.flood,
                    fillOpacity: 0.35,
                    radius: 10000,
                    className: 'pulse-layer',
                    weight: 2
                }).addTo(simGroup);
            }
        });

        simLayers[type] = simGroup;
        simGroup.addTo(map);
    } else {
        if (simLayers[type]) {
            map.removeLayer(simLayers[type]);
            delete simLayers[type];
        }
    }
}

function addSmartAlert(type, pos, message) {
    const icons = {
        'fishermen': '🚤',
        'aircraft': '✈️',
        'flood': '🌊',
        'default': '⚠️'
    };
    const iconChar = icons[type.toLowerCase()] || icons.default;
    const severityClass = type.toLowerCase() === 'flood' ? '' : (type.toLowerCase() === 'aircraft' ? 'info' : 'warning');

    const icon = L.divIcon({
        className: 'custom-alert-icon',
        html: `<div class="alert-marker ${severityClass}"><span>${iconChar}</span></div>`,
        iconSize: [36, 36]
    });

    const m = L.marker(pos, { icon: icon }).addTo(map);
    m.bindPopup(`<strong>${type} Intelligence</strong><br>${message}`).openPopup();
    alertMarkers.push(m);
}

/**
 * Phase 2: Tsunami Early Warning Visualization
 * Creates expanding wave rings from the epicenter
 */
function triggerTsunami(coords) {
    if (!map) return;
    
    // Clear old tsunami waves
    tsunamiLayers.forEach(l => map.removeLayer(l));
    tsunamiLayers = [];

    const center = coords || currentCoords;
    let radius = 10000;
    
    const interval = setInterval(() => {
        const wave = L.circle(center, {
            radius: radius,
            color: '#00f2ff',
            weight: 2,
            fillOpacity: 0,
            dashArray: '10, 10'
        }).addTo(map);
        
        tsunamiLayers.push(wave);
        radius += 50000;

        // Fade out old waves
        if (tsunamiLayers.length > 5) {
            const old = tsunamiLayers.shift();
            map.removeLayer(old);
        }

        if (radius > 1500000) {
            clearInterval(interval);
            tsunamiLayers.forEach(l => map.removeLayer(l));
        }
    }, 400);

    // Show safe zones automatically
    showSafeZones(true);
}

/**
 * Phase 2: Coastal Erosion & Safe Zones
 */
function toggleErosionMap(visible) {
    if (!map) return;
    if (erosionLayer) map.removeLayer(erosionLayer);
    
    if (visible) {
        erosionLayer = L.layerGroup([]);
        let city = 'Global';
        if (marker && marker.getPopup()) {
             const match = marker.getPopup().getContent().match(/<b>(.*?)<\/b>/);
             if (match) city = match[1];
        }

        const basePoints = COASTAL_REGIONS[city] || getDistributedPoints(currentCoords, 3, 10);
        
        // Connect points with line segments to trace coast better
        if (COASTAL_REGIONS[city]) {
            L.polyline(COASTAL_REGIONS[city], { 
                color: '#ff4d4d', 
                weight: 6, 
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(erosionLayer);
        } else {
            basePoints.forEach(p => {
                L.circle(p, { color: '#ff4d4d', radius: 8000, fillOpacity: 0.5 }).addTo(erosionLayer);
            });
        }
        
        erosionLayer.addTo(map);
    }
}

function showSafeZones(visible) {
    if (!map) return;
    if (safeZoneLayer) map.removeLayer(safeZoneLayer);

    if (visible) {
        safeZoneLayer = L.layerGroup([]);
        // Safe Zone Polygon (Inland)
        const safeZone = L.polygon([
            [currentCoords[0] + 0.2, currentCoords[1] + 0.2],
            [currentCoords[0] + 0.5, currentCoords[1] + 0.2],
            [currentCoords[0] + 0.5, currentCoords[1] + 0.5],
            [currentCoords[0] + 0.2, currentCoords[1] + 0.5]
        ], { color: '#00ff88', fillColor: '#00ff88', fillOpacity: 0.3 }).addTo(safeZoneLayer);
        
        safeZone.bindTooltip("SAFE ZONE / EVACUATION POINT");
        safeZoneLayer.addTo(map);
    }
}

/**
 * Phase 3: Pollution & Aquatic Health Layers
 */
function togglePollutionLayer(type, visible) {
    if (!map) return;
    
    const pollutionColors = {
        'plastic': '#e2e8f0', // Greyish white
        'oil': '#000000'      // Black (oil slick)
    };

    if (visible) {
        const pGroup = L.layerGroup([]);
        // Mock large pollution areas (Pacific Garbage Patch or Local Slick)
        const area = L.circle([currentCoords[0] + 2, currentCoords[1] - 5], {
            color: pollutionColors[type],
            fillColor: pollutionColors[type],
            fillOpacity: 0.5,
            radius: 400000
        }).addTo(pGroup);
        
        area.bindPopup(`MAJOR ${type.toUpperCase()} CONCENTRATION DETECTED`);
        pollutionLayers[type] = pGroup;
        pGroup.addTo(map);
    } else {
        if (pollutionLayers[type]) {
            map.removeLayer(pollutionLayers[type]);
            delete pollutionLayers[type];
        }
    }
}
