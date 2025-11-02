const Redis = require('ioredis');

const redisClient = new Redis({
    host: process.env.REDIS_HOST_URL,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PW,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));

module.exports = redisClient;
