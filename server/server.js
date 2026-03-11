const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weather');
const analyticsRoutes = require('./routes/analyticsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const newsRoutes = require('./routes/newsRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const ingestionService = require('./services/ingestionService');
const alertEngine = require('./analytics/alertEngine');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database Connection (Local JSON Storage)
const userDb = require('./database/userData');
userDb.initUserDB();
console.log('Local User Database initialized.');

// Optional: Keep MongoDB for future scale, but don't let it block
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/aquashield';
mongoose.connect(DB, { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('MongoDB connection successful (Scale Mode)'))
    .catch(err => console.log('MongoDB not found. Using local JSON storage for high performance.'));

// Initialize Services
alertEngine.initAlertEngine(wss);
ingestionService.startIngestion();

// Auth Routes (Public)
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api', protect, weatherRoutes);
app.use('/api', protect, analyticsRoutes);
app.use('/api', protect, predictionRoutes);
app.use('/api', protect, newsRoutes);

// WebSocket logic
wss.on('connection', (ws) => {
    console.log('Intelligent Dashboard Connected');
    ws.send(JSON.stringify({ type: 'STATUS', message: 'Intelligence Stream Active' }));
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`AquaShield Intelligence Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
