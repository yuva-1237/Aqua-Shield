/**
 * AquaShield UI & Environment Control Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initEnvControl();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
        // Only update buttons if they exist on the page
        if (typeof updateModeButtons === 'function') {
            updateModeButtons(savedTheme);
        }
    }
});

function initEnvControl() {
    const envBtn = document.getElementById('env-control-btn');
    const closeBtn = document.getElementById('close-env-panel');
    const envPanel = document.getElementById('env-panel');
    const envRing = document.getElementById('env-fab-ring');

    // Pulsing ring animation
    gsap.to(envRing, {
        scale: 1.6,
        opacity: 0,
        duration: 1.8,
        repeat: -1,
        ease: 'power2.out'
    });

    // Panel Toggle logic (CSS-powered)
    envBtn.addEventListener('click', () => {
        envPanel.classList.remove('hidden');
        setTimeout(() => envPanel.classList.add('active'), 10);
    });

    closeBtn.addEventListener('click', () => {
        envPanel.classList.remove('active');
        setTimeout(() => envPanel.classList.add('hidden'), 400); // Match CSS transition
    });

    // Drag-and-drop implementation
    const panelHeader = document.querySelector('.panel-header');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    panelHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset.x = e.clientX - envPanel.offsetLeft;
        offset.y = e.clientY - envPanel.offsetTop;
        panelHeader.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        envPanel.style.left = `${e.clientX - offset.x}px`;
        envPanel.style.top = `${e.clientY - offset.y}px`;
        envPanel.style.bottom = 'auto';
        envPanel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        panelHeader.style.cursor = 'grab';
    });

    // Theme Switching
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            updateModeButtons(mode);
            setTheme(mode);
        });
    });

    // Seasonal Switching
    const seasonBtns = document.querySelectorAll('.season-btn');
    seasonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const season = btn.dataset.season;
            updateSeasonButtons(season);
            setSeason(season);
        });
    });

    // Rain Simulation
    const rainRange = document.getElementById('rain-range');
    rainRange.addEventListener('input', (e) => {
        const intensity = e.target.value;
        if (typeof setRainIntensity === 'function') {
            setRainIntensity(intensity / 100);
        }
    });

    // Weather Layers
    const weatherLayers = ['wind', 'temp', 'humidity'];
    weatherLayers.forEach(l => {
        document.getElementById(`layer-${l}`).addEventListener('change', (e) => {
            toggleWeatherLayer(l, e.target.checked);
        });
    });

    // Auto-refresh weather layers every 5 minutes
    setInterval(() => {
        console.log('[AquaShield] Auto-refreshing weather layers...');
        weatherLayers.forEach(l => {
            if (document.getElementById(`layer-${l}`).checked) {
                toggleWeatherLayer(l, false);
                toggleWeatherLayer(l, true);
            }
        });
    }, 5 * 60 * 1000);

   // Timeline Slider
    const timeSlider = document.getElementById('time-slider');
    const yearDisplay = document.getElementById('current-year-display');

    timeSlider.addEventListener('input', (e) => {
        const year = e.target.value;
        yearDisplay.innerText = year === '2026' ? 'PRESENT' : year;
        
        if (typeof updateSimulationForYear === 'function') {
            updateSimulationForYear(parseInt(year));
        }
    });

    // Phase 2: Tsunami & Erosion Controls
    document.getElementById('trigger-tsunami').addEventListener('click', () => {
        if (typeof triggerTsunami === 'function') {
            triggerTsunami();
            console.log('[AquaShield] SEISMIC EVENT DETECTED: Tsunami Warning Issued');
        }
    });

    document.getElementById('sim-erosion').addEventListener('change', (e) => {
        if (typeof toggleErosionMap === 'function') {
            toggleErosionMap(e.target.checked);
        }
    });

    const surgeRange = document.getElementById('surge-range');
    surgeRange.addEventListener('input', (e) => {
        const intensity = e.target.value / 100;
        if (typeof setSurgeIntensity === 'function') {
            setSurgeIntensity(intensity);
        }
    });

    // Phase 3: Marine Health Controls
    document.getElementById('layer-coral').addEventListener('change', (e) => {
        if (typeof toggleCoralHeatmap === 'function') {
            toggleCoralHeatmap(e.target.checked);
        }
    });

    ['plastic', 'oil'].forEach(p => {
        document.getElementById(`layer-${p}`).addEventListener('change', (e) => {
            if (typeof togglePollutionLayer === 'function') {
                togglePollutionLayer(p, e.target.checked);
            }
        });
    });

    // Climate Simulation
    ['slr', 'flood'].forEach(s => {
        document.getElementById(`sim-${s}`).addEventListener('change', (e) => {
            if (typeof toggleClimateSim === 'function') {
                toggleClimateSim(s, e.target.checked);
            }
        });
    });

    // Community Reports
    const reportBtn = document.getElementById('open-report-btn');
    const reportModal = document.getElementById('report-modal');
    const closeModal = document.getElementById('close-modal');
    const reportForm = document.getElementById('report-form');

    reportBtn.addEventListener('click', () => reportModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => reportModal.classList.add('hidden'));

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('report-type').value;
        const desc = document.getElementById('report-desc').value;
        
        const list = document.getElementById('reports-list');
        const empty = list.querySelector('.empty-msg');
        if (empty) empty.remove();

        const item = document.createElement('div');
        item.className = 'hazard-item';
        item.style.padding = '0.5rem';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.borderRadius = '8px';
        item.style.marginBottom = '0.5rem';
        item.innerHTML = `<strong style="color:var(--accent); text-transform:uppercase; font-size:0.65rem;">${type}</strong><br>${desc}`;
        
        list.prepend(item);
        gsap.from(item, { height: 0, opacity: 0, duration: 0.5 });
        
        reportModal.classList.add('hidden');
        reportForm.reset();
        
        // Broadcast via local alert if needed
        if (typeof displayLiveAlerts === 'function') {
            displayLiveAlerts([{ agent: 'Citizen', type: `COMMUNITY: ${type}`, message: desc, severity: 'INFO', icon: '👥' }]);
        }
    });

    // Phase 5: Voice Commands (Web Speech API)
    initVoiceCommands();
}

function initVoiceCommands() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const indicator = document.getElementById('voice-indicator');
    const transcript = document.getElementById('voice-transcript');

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'v' && indicator.classList.contains('hidden')) {
            recognition.start();
            indicator.classList.remove('hidden');
        }
    });

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        transcript.innerText = `Matched: "${command}"`;
        handleVoiceCommand(command);
        setTimeout(() => indicator.classList.add('hidden'), 2000);
    };

    recognition.onerror = () => indicator.classList.add('hidden');
    recognition.onend = () => setTimeout(() => indicator.classList.add('hidden'), 5000);
}

function handleVoiceCommand(cmd) {
    if (cmd.includes('analyze')) {
        const city = cmd.replace('analyze', '').trim();
        if (city && typeof runIntelligenceAnalysis === 'function') {
            document.getElementById('city-input').value = city;
            runIntelligenceAnalysis(city);
        }
    } else if (cmd.includes('dark mode')) {
        setTheme('dark');
        updateModeButtons('dark');
    } else if (cmd.includes('light mode')) {
        setTheme('light');
        updateModeButtons('light');
    } else if (cmd.includes('tsunami')) {
        if (typeof triggerTsunami === 'function') triggerTsunami();
    }
}

function updateModeButtons(activeMode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === activeMode);
    });
}

function updateSeasonButtons(activeSeason) {
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.season === activeSeason);
    });
}

function setTheme(mode) {
    localStorage.setItem('theme', mode);
    
    if (mode === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    // Update Map Theme if function exists
    if (typeof setMapTheme === 'function') {
        setMapTheme(mode);
    }
}

function setSeason(season) {
    console.log(`[AquaShield] Setting season to: ${season.toUpperCase()}`);
    // Update Three.js effects if function exists
    if (typeof setSeasonEffect === 'function') {
        setSeasonEffect(season);
    }
}

function toggleWeatherLayer(layer, visible) {
    console.log(`[AquaShield] Weather layer ${layer.toUpperCase()}: ${visible ? 'ON' : 'OFF'}`);
    // Update Map layers if function exists
    if (typeof updateWeatherLayer === 'function') {
        updateWeatherLayer(layer, visible);
    }
}
