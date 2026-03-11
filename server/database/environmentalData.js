const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'environmental_db.json');

const initDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({
            history: [],
            alerts: [],
            projections: {}
        }, null, 2));
    }
};

const saveData = (collection, data) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH));
    db[collection].push({
        ...data,
        timestamp: new Date().toISOString()
    });
    // Keep last 100 entries for efficiency
    if (db[collection].length > 100) db[collection].shift();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

const getData = (collection) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH));
    return db[collection];
};

module.exports = { initDB, saveData, getData };
