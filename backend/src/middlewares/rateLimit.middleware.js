const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClient = require('../config/redis');

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl', // tránh trùng key với OTP
    points: 5,       // 5 request
    duration: 60,    // mỗi 60 giây
});

const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch {
        res.status(429).json({ message: 'Too many requests. Try again later.' });
    }
};

module.exports = { rateLimitMiddleware };
