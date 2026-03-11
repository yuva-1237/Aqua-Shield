const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userDb = require('../database/userData');

const JWT_SECRET = process.env.JWT_SECRET || 'aquashield-secret-key-2026';
const JWT_EXPIRES_IN = '90d';

const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userResponse
        }
    });
};

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;

        if (password !== passwordConfirm) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if user exists
        if (userDb.findUserByEmail(email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = userDb.saveUser({
            name,
            email,
            password: hashedPassword
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = userDb.findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
