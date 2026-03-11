const express = require('express');
const router = express.Router();
const { fetchEnvironmentNews } = require('../services/newsService');
const newsAgent = require('../agents/NewsAgent');

router.get('/environment-news', async (req, res) => {
    try {
        const articles = await fetchEnvironmentNews();
        
        // Let News Agent analyze for high-impact intelligence
        const intel = newsAgent.analyze(articles);
        
        // Return both articles and any agent-flagged intelligence
        res.json({ articles, intel });
    } catch (err) {
        res.status(500).json({ error: err.message, articles: [] });
    }
});

module.exports = router;
