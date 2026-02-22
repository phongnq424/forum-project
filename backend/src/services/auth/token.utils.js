const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_EXPIRY = '30m';
const REFRESH_EXPIRY_DAYS = 30;

exports.generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_EXPIRY }
    );
};

exports.generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

exports.hashRefreshToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

exports.getDeviceInfo = (req) => {
    return {
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
    };
};