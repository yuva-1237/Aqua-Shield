let newsCache = null;
let newsPanelOpen = false;

const TOPIC_ICONS = {
    ocean: '🌊', coral: '🪸', flood: '🌧️', climate: '🌍',
    warming: '🔥', marine: '🐠', pollution: '♻️', disaster: '⚠️',
    glacier: '🧊', reef: '🪸', sea: '🌊', default: '📰'
};

function getIcon(text) {
    const t = text.toLowerCase();
    for (const [key, icon] of Object.entries(TOPIC_ICONS)) {
        if (t.includes(key)) return icon;
    }
    return TOPIC_ICONS.default;
}

function formatDate(iso) {
    if (!iso || iso === 'N/A') return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initNewsPanel() {
    // Inject DOM
    document.body.insertAdjacentHTML('beforeend', `
        <div class="fab-ring" id="fab-ring"></div>
        <button id="news-fab" title="Environmental News">📰</button>

        <div id="news-overlay"></div>

        <div id="news-panel">
            <div class="news-panel-header">
                <h2><span>🌊</span> Real-Time Environmental Intelligence</h2>
                <button class="news-close-btn" id="news-close-btn">✕</button>
            </div>
            <div class="news-filters">
                <span class="news-filter-tag">🪸 Marine Ecosystems</span>
                <span class="news-filter-tag">🌧️ Coastal Flooding</span>
                <span class="news-filter-tag">🌍 Climate Change</span>
                <span class="news-filter-tag">🌊 Sea Level Rise</span>
                <span class="news-filter-tag">🔥 Global Warming</span>
                <span class="news-filter-tag">♻️ Ocean Pollution</span>
            </div>
            <div id="news-feed">
                <div class="news-loading">
                    <div class="news-spinner"></div>
                    <span>Fetching intelligence stream...</span>
                </div>
            </div>
        </div>
    `);

    const fab = document.getElementById('news-fab');
    const ring = document.getElementById('fab-ring');
    const panel = document.getElementById('news-panel');
    const overlay = document.getElementById('news-overlay');
    const closeBtn = document.getElementById('news-close-btn');

    // Pulsing ring animation
    gsap.to(ring, {
        scale: 1.6,
        opacity: 0,
        duration: 1.8,
        repeat: -1,
        ease: 'power2.out'
    });

    fab.addEventListener('click', openNewsPanel);
    overlay.addEventListener('click', closeNewsPanel);
    closeBtn.addEventListener('click', closeNewsPanel);
}

function openNewsPanel() {
    if (newsPanelOpen) return;
    newsPanelOpen = true;

    const panel = document.getElementById('news-panel');
    const overlay = document.getElementById('news-overlay');

    overlay.style.display = 'block';
    panel.style.display = 'flex';

    gsap.to(overlay, { opacity: 1, duration: 0.3 });
    gsap.fromTo(panel, { y: '100%' }, { y: '0%', duration: 0.5, ease: 'power3.out' });

    if (!newsCache) fetchNews();
}

function closeNewsPanel() {
    const panel = document.getElementById('news-panel');
    const overlay = document.getElementById('news-overlay');

    gsap.to(panel, {
        y: '100%', duration: 0.4, ease: 'power3.in',
        onComplete: () => { panel.style.display = 'none'; }
    });
    gsap.to(overlay, {
        opacity: 0, duration: 0.3,
        onComplete: () => { overlay.style.display = 'none'; }
    });
    newsPanelOpen = false;
}

async function fetchNews() {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '<div class="news-loading"><div class="news-spinner"></div><span>Fetching intelligence stream...</span></div>';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/environment-news', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Server connection failed');
        
        newsCache = data.articles || [];
        renderNews(newsCache);
    } catch (err) {
        feed.innerHTML = `<div class="news-loading" style="color:#ff0055">⚠️ Could not load news stream: ${err.message}</div>`;
    }
}

function renderNews(articles) {
    const feed = document.getElementById('news-feed');
    feed.innerHTML = '';

    if (!articles.length) {
        feed.innerHTML = '<div class="news-loading">No environmental news found at this time.</div>';
        return;
    }

    articles.forEach((article, i) => {
        const icon = getIcon(article.title + ' ' + (article.description || ''));
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.opacity = '0';

        card.innerHTML = `
            <div class="news-card-img">
                ${article.image
                    ? `<img src="${article.image}" alt="news" onerror="this.parentElement.innerHTML='${icon}'" loading="lazy">`
                    : icon}
            </div>
            <div class="news-card-body">
                <div class="news-card-meta">
                    <span class="news-card-source">${article.source}</span>
                    <span>${formatDate(article.publishedAt)}</span>
                </div>
                <p class="news-card-title">${article.title}</p>
                <a class="news-card-read" href="${article.url}" target="_blank" rel="noopener noreferrer">Read Article →</a>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('news-card-read')) {
                window.open(article.url, '_blank');
            }
        });

        feed.appendChild(card);

        // Staggered entrance
        gsap.to(card, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out' });
        gsap.from(card, { y: 20, duration: 0.4, delay: i * 0.06 });
    });
}

// Auto-refresh every 30 minutes
setInterval(() => {
    newsCache = null;
    if (newsPanelOpen) fetchNews();
}, 30 * 60 * 1000);

window.addEventListener('DOMContentLoaded', initNewsPanel);
