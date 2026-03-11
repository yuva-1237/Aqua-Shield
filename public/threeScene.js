let scene, camera, renderer, earth, particles, rainParticles, sea, evaporationParticles;
let coralHeatmap = null;
let cycloneParticles = []; // Array of cyclone particle systems
let ambientLight, mainLight;

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Optimized Lighting for Sat-Monitoring look
    ambientLight = new THREE.AmbientLight(0x0a192f, 1);
    scene.add(ambientLight);

    mainLight = new THREE.PointLight(0x00f2ff, 2);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // Earth Sphere
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: 0x051a3a,
        emissive: 0x001122,
        specular: 0x00f2ff,
        shininess: 30,
        transparent: true,
        opacity: 0.9,
    });
    
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Atmosphere Glow
    const glowGeo = new THREE.SphereGeometry(2.7, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Initializations
    createParticles();
    createRainSystem();
    createSea();
    createEvaporationSystem();
    createCoralHeatmap();
    
    // Phase 1 Expansion: Cyclone Tracking
    createCyclone(1.5, 0.5, 0x00f2ff); // Sample Cyclone Alpha
    createCyclone(-1.0, -1.2, 0xff4757); // Sample Cyclone Beta (Critical)

    camera.position.z = 6;
    animate();
}

function createParticles() {
    const particleCount = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const r = 3 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: 0x00f2ff,
        size: 0.02,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geo, mat);
    scene.add(particles);
}

/**
 * Creates a spinning cyclone particle system at given lat/lon (simplified projection)
 */
function createCyclone(lat, lon, color) {
    const count = 800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const radius = 2.51; // Slightly above earth surface

    for (let i = 0; i < count; i++) {
        // Spiral formation
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 0.5;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        
        // Convert to spherical coords around the base lat/lon
        const phi = (90 - (lat * 20)) * (Math.PI / 180);
        const theta = (lon * 20 + 180) * (Math.PI / 180);

        pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta) + x;
        pos[i * 3 + 1] = radius * Math.cos(phi) + y;
        pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: color,
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const cyclone = new THREE.Points(geo, mat);
    cyclone.userData = { rotation: 0.05 + Math.random() * 0.05 };
    scene.add(cyclone);
    cycloneParticles.push(cyclone);
}

/**
 * Phase 3: Coral Reef Health 3D Heatmap
 */
function createCoralHeatmap() {
    const geo = new THREE.SphereGeometry(2.55, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xff4d4d,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        visible: false // Hidden by default
    });
    coralHeatmap = new THREE.Mesh(geo, mat);
    scene.add(coralHeatmap);
}

function toggleCoralHeatmap(visible) {
    if (coralHeatmap) coralHeatmap.visible = visible;
}

function animate() {
    requestAnimationFrame(animate);
    if (earth) earth.rotation.y += 0.0015;
    if (particles) {
        particles.rotation.y += 0.001;
        particles.rotation.z += 0.0005;
    }
    
    // Animate cyclones
    cycloneParticles.forEach(c => {
        c.rotation.y += 0.01; // Spin effect
        // Optional: orbit with earth
        c.position.x = Math.sin(Date.now() * 0.0001) * 0.01; 
    });

    if (rainParticles) {
        const pos = rainParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i+1] -= 0.05 * (rainParticles.material.opacity * 2); // Fall speed
            if (pos[i+1] < -3) pos[i+1] = 3; // Reset to top
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
    }
    if (sea) {
        const time = Date.now() * 0.001;
        const pos = sea.geometry.attributes.position.array;
        const amp = sea.userData.waveAmp || 0.05;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i+2] = Math.sin(pos[i] * 2 + time) * amp + Math.cos(pos[i+1] * 2 + time) * amp;
        }
        sea.geometry.attributes.position.needsUpdate = true;
    }
    if (evaporationParticles && evaporationParticles.visible) {
        const pos = evaporationParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            pos[i+1] += 0.01; // Rise
            if (pos[i+1] > 1) pos[i+1] = -2.5; // Reset
        }
        evaporationParticles.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
}

function createEvaporationSystem() {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        pos[i*3] = (Math.random() - 0.5) * 5;
        pos[i*3+1] = -2.5 + Math.random();
        pos[i*3+2] = (Math.random() - 0.5) * 5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: 0x00f2ff,
        size: 0.01,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    evaporationParticles = new THREE.Points(geo, mat);
    evaporationParticles.visible = false;
    scene.add(evaporationParticles);
}

function createSea() {
    const geo = new THREE.PlaneGeometry(6, 6, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
        color: 0x0072ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        flatShading: true
    });
    sea = new THREE.Mesh(geo, mat);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -2.6; // Below earth
    sea.userData = { baseLevel: -2.6, waveAmp: 0.05 };
    scene.add(sea);
}

/**
 * Phase 2: Storm Surge 3D Simulation
 */
function setSurgeIntensity(intensity) {
    if (!sea) return;
    // Raise sea level and intensity wave height
    gsap.to(sea.position, { y: sea.userData.baseLevel + (intensity * 0.4), duration: 1.5 });
    sea.userData.waveAmp = 0.05 + (intensity * 0.15);
}

function createRainSystem() {
    const count = 5000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        pos[i*3] = (Math.random() - 0.5) * 10;
        pos[i*3+1] = (Math.random() - 0.5) * 10;
        pos[i*3+2] = (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: 0x00f2ff,
        size: 0.02,
        transparent: true,
        opacity: 0, // Start hidden
        blending: THREE.AdditiveBlending
    });
    rainParticles = new THREE.Points(geo, mat);
    scene.add(rainParticles);
}

function setRainIntensity(intensity) {
    if (rainParticles) {
        rainParticles.material.opacity = intensity;
        rainParticles.visible = intensity > 0;
    }
}

function setSeasonEffect(season) {
    const themes = {
        'summer': { ambient: 0x221100, main: 0xffcc00, earth: 0x0a1a3a },
        'monsoon': { ambient: 0x0a192f, main: 0x00f2ff, earth: 0x051a3a },
        'winter': { ambient: 0x111d2b, main: 0xb3e5fc, earth: 0x081e33 }
    };

    const config = themes[season] || themes['monsoon'];
    
    gsap.to(ambientLight.color, { r: ((config.ambient >> 16) & 255) / 255, g: ((config.ambient >> 8) & 255) / 255, b: (config.ambient & 255) / 255, duration: 2 });
    gsap.to(mainLight.color, { r: ((config.main >> 16) & 255) / 255, g: ((config.main >> 8) & 255) / 255, b: (config.main & 255) / 255, duration: 2 });
    gsap.to(earth.material.color, { r: ((config.earth >> 16) & 255) / 255, g: ((config.earth >> 8) & 255) / 255, b: (config.earth & 255) / 255, duration: 2 });

    if (season === 'summer') {
        setRainIntensity(0);
        if (evaporationParticles) evaporationParticles.visible = true;
    } else if (season === 'monsoon') {
        setRainIntensity(0.5);
        if (evaporationParticles) evaporationParticles.visible = false;
    } else {
        setRainIntensity(0);
        if (evaporationParticles) evaporationParticles.visible = false;
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

initThree();
