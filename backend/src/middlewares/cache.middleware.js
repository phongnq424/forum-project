const redisCache = require('../config/redisCache');

const cache = async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = `cache:${req.originalUrl}`;

    try {
        const cachedData = await redisCache.get(key);
        if (cachedData) {
            console.log('⚡ Dữ liệu lấy từ cache');
            return res.json(JSON.parse(cachedData));
        }
    } catch (err) {
        console.error('❌ Redis GET error:', err);
    }

    res.sendResponse = res.json;
    res.json = async (body) => {
        if (res.statusCode === 200) {
            try {
                await redisCache.set(key, JSON.stringify(body), 'EX', 120)

            } catch (err) {
                console.error('❌ Redis SET error:', err);
            }
        }
        res.sendResponse(body);
    };

    next();
};

module.exports = { cache };
