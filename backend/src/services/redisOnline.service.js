const redisClient = require("../config/redis");

const ONLINE_TTL = 60;

const RedisOnlineService = {

    async setOnline(userId, socketId) {
        await redisClient.set(
            `online:user:${userId}`,
            socketId,
            "EX",
            ONLINE_TTL
        );

        await redisClient.sadd("online:users", userId);
    },

    async setOffline(userId) {
        await redisClient.del(`online:user:${userId}`);
        await redisClient.srem("online:users", userId);
    },

    async isOnline(userId) {
        const exists = await redisClient.exists(`online:user:${userId}`);
        return exists === 1;
    },

    async getOnlineUsers() {
        return await redisClient.smembers("online:users");
    },

    async refresh(userId) {
        const socketId = await redisClient.get(`online:user:${userId}`);
        if (!socketId) return;

        await redisClient.expire(`online:user:${userId}`, ONLINE_TTL);
    }
};

module.exports = RedisOnlineService;