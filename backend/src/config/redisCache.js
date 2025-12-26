const Redis = require("ioredis");

const redisCache = new Redis({
    host: "127.0.0.1",
    port: 6379
});

redisCache.on("connect", () =>
    console.log("✅ Redis cache (offline) connected")
);

redisCache.on("error", (err) =>
    console.error("❌ Redis cache error:", err)
);

module.exports = redisCache;
