const fs = require('fs');
const path = require('path');

const USER_DB_PATH = path.join(__dirname, 'users_db.json');

const initUserDB = () => {
    if (!fs.existsSync(USER_DB_PATH)) {
        fs.writeFileSync(USER_DB_PATH, JSON.stringify({
            users: []
        }, null, 2));
    }
};

const saveUser = (user) => {
    initUserDB();
    const db = JSON.parse(fs.readFileSync(USER_DB_PATH));
    db.users.push({
        ...user,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
    });
    fs.writeFileSync(USER_DB_PATH, JSON.stringify(db, null, 2));
    return db.users[db.users.length - 1];
};

const findUserByEmail = (email) => {
    initUserDB();
    const db = JSON.parse(fs.readFileSync(USER_DB_PATH));
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = (id) => {
    initUserDB();
    const db = JSON.parse(fs.readFileSync(USER_DB_PATH));
    return db.users.find(u => u._id === id);
};

module.exports = { saveUser, findUserByEmail, findUserById, initUserDB };
