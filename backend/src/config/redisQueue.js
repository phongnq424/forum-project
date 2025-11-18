// config/redisQueue.js
const Redis = require('ioredis');

const redisQueue = new Redis({
    host: process.env.REDIS_HOST_URL,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PW,
});

redisQueue.on('connect', () => console.log('✅ Redis queue connected'));
redisQueue.on('error', (err) => console.error('❌ Redis queue error:', err));

module.exports = redisQueue;
