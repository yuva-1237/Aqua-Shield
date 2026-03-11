let socket;
let lastAnalysisData = null; // Store for temporal projection
let lastProjections = null;

document.addEventListener('DOMContentLoaded', () => {
    gsap.to('#loading-screen p', { opacity: 0.4, duration: 1, repeat: -1, yoyo: true });

    setTimeout(() => {
        gsap.to('#loading-screen', {
            opacity: 0,
            duration: 1.5,
            onComplete: () => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                if (typeof initMap === 'function') initMap();
                if (typeof refreshMap === 'function') refreshMap();
                initDashboard();
                initWebSocket();
            }
        });
    }, 2500);
});

function initWebSocket() {
    try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        socket = new WebSocket(`${protocol}://${window.location.host}`);
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'ALERT' || msg.type === 'AGENT_INTEL') {
                const alerts = Array.isArray(msg.data) ? msg.data : [msg.data];
                displayLiveAlerts(alerts, false);
            }
        };
        socket.onopen = () => console.log('[AquaShield] Intelligence Stream Active');
        socket.onerror = (e) => console.warn('[AquaShield] WS unavailable, using poll mode');
    } catch (e) { console.warn('WS init failed', e); }
}

function initDashboard() {
    gsap.from('header', { y: -50, opacity: 0, duration: 1.2, ease: 'expo.out' });
    gsap.from('.panel', { opacity: 0, y: 30, duration: 1, stagger: 0.2, ease: 'power3.out' });

    document.getElementById('search-btn').addEventListener('click', () =>
        runIntelligenceAnalysis(document.getElementById('city-input').value.trim()));
    document.getElementById('city-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') runIntelligenceAnalysis(document.getElementById('city-input').value.trim());
    });
    // Display user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('user-display').innerText = `ACCESS: ${user.name.toUpperCase()}`;
    }
}

async function runIntelligenceAnalysis(city) {
    if (!city) return;
    try {
        updateBtnState(true);
        const token = localStorage.getItem('token');
        const [analysis, projections] = await Promise.all([
            fetch(`/api/analyze-all?city=${encodeURIComponent(city)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch(`/api/projections?city=${encodeURIComponent(city)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json())
        ]);
        if (analysis.error) throw new Error(analysis.error);
        lastAnalysisData = analysis;
        lastProjections = projections;
        updateUI(analysis, projections);
    } catch (err) {
        console.error('[AquaShield] Analysis error:', err.message);
        if (err.message.includes('logged in')) window.logout();
    } finally {
        updateBtnState(false);
    }
}

function updateBtnState(loading) {
    const btn = document.getElementById('search-btn');
    btn.innerText = loading ? 'ANALYZING...' : 'ANALYZE RISK';
    btn.disabled = loading;
}

function updateUI(data, projections) {
    const { climate, flood, aquatic, city, lat, lon } = data;

    // ── Monitoring Metrics ──
    // ── Monitoring Metrics ──
    const actualTemp = (data.weather && data.weather.temp_c !== undefined) 
        ? data.weather.temp_c 
        : (climate.details && climate.details.tempAnomaly !== undefined ? (24 + climate.details.tempAnomaly) : 24);
    
    const anomalyVal = (climate.details && climate.details.tempAnomaly !== undefined)
        ? climate.details.tempAnomaly.toFixed(1)
        : "0.0";

    document.getElementById('temp-val').innerHTML = `${actualTemp.toFixed(1)}°C <small style="font-size:0.6rem; opacity:0.6; display:block;">Anomaly: +${anomalyVal}°C</small>`;
    document.getElementById('flood-val').innerText = `${flood.score || '--'}`;
    document.getElementById('heat-val').innerText = climate.category || '--';
    document.getElementById('ocean-val').innerText = aquatic.classification ? aquatic.classification.split(' ')[0] : '--';

    // ── Risk Bars (colour by level) ──
    const floodColor = flood.score > 60 ? '#ff0055' : flood.score > 30 ? '#ff8800' : '#00ff88';
    const climateColor = climate.score > 60 ? '#ff8800' : climate.score > 30 ? '#ffdd00' : '#00ff88';
    const aquaticColor = aquatic.score > 60 ? '#ff0055' : aquatic.score > 30 ? '#ffdd00' : '#00ff88';

    gsap.to('#flood-bar',   { width: `${flood.score}%`,   backgroundColor: floodColor,   duration: 1.5 });
    gsap.to('#climate-bar', { width: `${climate.score}%`, backgroundColor: climateColor, duration: 1.5 });
    gsap.to('#aquatic-bar', { width: `${aquatic.score}%`, backgroundColor: aquaticColor, duration: 1.5 });

    // ── Sea Level Gauge ──
    const sl2050 = projections.find(p => p.year === 2050) || projections[projections.length - 1];
    const seaCm = sl2050 ? parseFloat(sl2050.prediction.toFixed(1)) : 0.0;
    const gaugePercent = Math.min(100, (seaCm / 30) * 100);           // max gauge at 30 cm
    gsap.to('#sl-indicator', { height: `${gaugePercent}%`, duration: 2 });
    document.getElementById('sl-2050').innerText = `+${seaCm} cm`;
    document.getElementById('land-loss').innerText = seaCm > 0 ? `${(seaCm * 0.4).toFixed(2)}%` : "0.00%";

    // ── Aquatic Bio-Health ──
    const ecoBox = document.getElementById('aquatic-status');
    document.getElementById('eco-category').innerText = aquatic.classification;
    const ecoDescriptions = {
        'Healthy Ecosystem':         'Marine biodiversity is stable. Ocean temperatures and oxygen levels are within normal parameters.',
        'Moderate Stress':           'Elevated ocean temperatures detected. Coral bleaching risk is rising. Monitoring required.',
        'High Risk':                 'Significant ecosystem stress. Dissolved oxygen declining, pollution index elevated. Action needed.',
        'Ecosystem Collapse Risk':   '⚠️ CRITICAL: Marine ecosystem is at collapse risk. Coral reefs critically damaged. Emergency response required.'
    };
    document.getElementById('eco-desc').innerText = ecoDescriptions[aquatic.classification] || 'Ecosystem status unknown.';
    ecoBox.className = 'status-box';
    if (aquatic.classification.includes('Healthy'))  ecoBox.style.borderColor = '#00ff88';
    else if (aquatic.classification.includes('Moderate')) ecoBox.style.borderColor = '#ffdd00';
    else if (aquatic.classification.includes('High')) ecoBox.style.borderColor = '#ff8800';
    else ecoBox.style.borderColor = '#ff0055';

    // ── Projections Chart ──
    if (typeof updateCharts === 'function') {
        const formatted = projections.map(p => ({
            year: p.year,
            increase: parseFloat(p.prediction.toFixed(2)),
            floodProbability: parseFloat(Math.min(100, p.prediction * 4).toFixed(1))
        }));
        updateCharts(formatted);
    }

    // ── Map ──
    if (typeof updateMap === 'function') updateMap(city, lat, lon, climate.category);

    // ── Inline Alerts (not dependent on WS) ──
    const inlineAlerts = [];
    if (flood.score > 40) {
        inlineAlerts.push({ type: 'Flood Risk', message: `Flood risk level "${flood.category}" detected for ${city}`, severity: flood.score > 60 ? 'CRITICAL' : 'WARNING' });
        if (typeof addSmartAlert === 'function') addSmartAlert('Flood', [lat, lon], `High flood probability in ${city}`);
    }
    
    // Sector-specific intelligence
    if (flood.score > 30) {
        inlineAlerts.push({ type: 'Fishermen Alert', message: 'High wave intensity & surge risk. Unsafe for small vessels.', severity: 'WARNING' });
        if (typeof addSmartAlert === 'function') addSmartAlert('Fishermen', [lat + 0.1, lon + 0.1], 'High waves & storm surge');
    }
    
    if (climate.details.tempAnomaly > 1.5) {
        inlineAlerts.push({ type: 'Aircraft Alert', message: 'Severe atmospheric turbulence predicted in lower altitudes.', severity: 'INFO' });
        if (typeof addSmartAlert === 'function') addSmartAlert('Aircraft', [lat - 0.1, lon - 0.1], 'Severe turbulence & lightning risk');
    }

    if (climate.score > 40) inlineAlerts.push({ type: 'Climate Risk', message: `Inland climate risk "${climate.category}" in ${city} region`, severity: climate.score > 60 ? 'CRITICAL' : 'WARNING' });
    if (aquatic.score > 30) inlineAlerts.push({ type: 'Marine Ecosystem', message: `${aquatic.classification} detected in ${city} coastal waters`, severity: aquatic.score > 60 ? 'CRITICAL' : 'WARNING' });

    // Always show a summary even if low risk
    if (inlineAlerts.length === 0) {
        inlineAlerts.push({ type: 'All Systems Normal', message: `No critical thresholds exceeded for ${city}. Monitoring active.`, severity: 'INFO' });
    }

    // ── Phase 3: Marine Health Widgets ──
    const plasticIdx = (15 + (aquatic.score * 0.6) + (climate.score * 0.2)).toFixed(0);
    const bioIdx = (95 - (aquatic.score * 0.8)).toFixed(1);
    
    document.getElementById('plastic-idx').innerText = plasticIdx;
    document.getElementById('bio-idx').innerText = `${bioIdx}%`;

    displayLiveAlerts(inlineAlerts, true);
}

/**
 * Phase 1: Temporal Simulation Logic
 * Adjusts the current analysis based on the selected target year
 */
function updateSimulationForYear(year) {
    if (!lastAnalysisData || !lastProjections) return;

    const targetProj = lastProjections.find(p => p.year === year) || lastProjections[0];
    const seaIncrease = targetProj.prediction; // in cm
    const tempAnomaly = targetProj.temp_anomaly || (0.4 + ((year - 2026) * 0.05)); // Fallback if missing
    
    const simulatedData = JSON.parse(JSON.stringify(lastAnalysisData));
    
    // Impact calculations
    simulatedData.climate.details.tempAnomaly = tempAnomaly;
    simulatedData.flood.score = Math.min(100, lastAnalysisData.flood.score + (seaIncrease * 2));
    
    const tempDiff = tempAnomaly - lastAnalysisData.climate.details.tempAnomaly;
    simulatedData.aquatic.score = Math.min(100, lastAnalysisData.aquatic.score + (tempDiff * 15));

    // Special Hazard Widgets (Phase 2 Preview)
    document.getElementById('tsunami-status').innerText = simulatedData.flood.score > 80 ? 'CRITICAL RISK' : 'STABLE';
    document.getElementById('surge-val').innerText = `+${(seaIncrease * 0.8).toFixed(1)}m`;
    document.getElementById('plastic-idx').innerText = `${(40 + (yearDiff * 1.5)).toFixed(0)}`;
    document.getElementById('bio-idx').innerText = (90 - (yearDiff * 2)) + '%';

    updateUI(simulatedData, lastProjections);
    
    // Visual feedback for time travel
    gsap.fromTo('#dashboard', { filter: 'hue-rotate(90deg) brightness(1.5)' }, { filter: 'hue-rotate(0deg) brightness(1)', duration: 0.5 });
}

function displayLiveAlerts(alerts, replace = false) {
    const list = document.getElementById('alerts-list');
    const banner = document.getElementById('critical-alert');
    if (replace) list.innerHTML = '';

    const hasCritical = alerts.some(a => a.severity === 'CRITICAL');
    if (hasCritical) banner.classList.remove('hidden');
    else if (replace) banner.classList.add('hidden');

    alerts.forEach(a => {
        const item = document.createElement('div');
        const borderColor = a.severity === 'CRITICAL' ? '#ff0055' : a.severity === 'WARNING' ? '#ff8800' : '#00f2ff';
        const agentName = a.agent || 'System';
        const agentIcon = a.icon || '';

        item.style.cssText = `padding:0.8rem 1rem;border-radius:12px;margin-bottom:0.75rem;background:rgba(255,255,255,0.03);border-left:4px solid ${borderColor};font-size:0.85rem;position:relative;`;
        
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.7rem; color:rgba(255,255,255,0.5); font-weight:700; text-transform:uppercase; letter-spacing:1px;">
                    ${agentIcon} ${agentName}
                </span>
                <span style="font-size:0.65rem; padding:1px 6px; border-radius:4px; background:${borderColor}22; color:${borderColor}; font-weight:700;">
                    ${a.severity}
                </span>
            </div>
            <strong style="color:#fff; display:block; margin-bottom:3px;">${a.type}</strong>
            <div style="color:rgba(255,255,255,0.8); line-height:1.4;">${a.message}</div>
        `;
        list.prepend(item);
        gsap.from(item, { x: -20, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
    });
}
