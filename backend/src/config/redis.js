const { createClient } = require('redis');

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST_URL,
        port: process.env.REDIS_PORT,
    },
    password: process.env.REDIS_PW,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error', err));

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('❌ Failed to connect Redis:', err);
    }
})();

module.exports = redisClient;
