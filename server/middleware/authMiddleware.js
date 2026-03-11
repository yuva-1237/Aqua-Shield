const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const userDb = require('../database/userData');

const JWT_SECRET = process.env.JWT_SECRET || 'aquashield-secret-key-2026';

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'You are not logged in!' });
        }

        const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
        const currentUser = userDb.findUserById(decoded.id);

        if (!currentUser) {
            // Vercel Serverless uses ephemeral /tmp storage that wipes frequently.
            // If the JWT is valid but the DB is wiped, reconstruct the session.
            if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
                req.user = { _id: decoded.id, name: 'Vercel User', email: 'demo@aquashield.app' };
                return next();
            }
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
};
