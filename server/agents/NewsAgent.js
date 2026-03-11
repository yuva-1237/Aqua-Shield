/**
 * News Intelligence Agent
 * Filters and prioritizes relevant environmental news articles.
 */
class NewsAgent {
    constructor() {
        this.name = 'News Intelligence Agent';
        this.id = 'agent_news';
        this.icon = '📰';
    }

    analyze(articles) {
        const alerts = [];
        
        // Filter for high-impact critical events
        const criticalKeywords = ['emergency', 'catastrophe', 'record high', 'deadly', 'disaster', 'melting', 'collapse'];

        const criticalNews = articles.filter(a => {
            const title = a.title.toLowerCase();
            return criticalKeywords.some(kw => title.includes(kw));
        });

        criticalNews.forEach(news => {
            alerts.push({
                agent: this.name,
                type: 'Intel Alert',
                message: `🆕 NEWS INTEL: ${news.title} (${news.source})`,
                severity: 'INFO',
                icon: this.icon,
                url: news.url
            });
        });

        return alerts;
    }
}

module.exports = new NewsAgent();
