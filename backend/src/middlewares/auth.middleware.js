const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

// Hàm helper chung
const checkToken = async (token) => {
    if (!token) return null;

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) throw new Error('BLACKLISTED');

    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return resolve(null); // token sai → coi như null
            resolve(decoded);
        });
    });
};

// Middleware bắt buộc token
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    try {
        const decoded = await checkToken(token);
        if (!decoded) return res.status(401).json({ message: 'Unauthorized' });
        req.user = decoded;
        next();
    } catch (err) {
        if (err.message === 'BLACKLISTED') {
            return res.status(403).json({ message: 'Token has been logged out' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware tùy chọn token
const verifyTokenOptional = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    try {
        const decoded = await checkToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.message === 'BLACKLISTED') {
            return res.status(403).json({ message: 'Token has been logged out' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { verifyToken, verifyTokenOptional };
