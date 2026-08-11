"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.getRedisClient = void 0;
// src/config/redis.ts
const redis_1 = require("redis");
let redisClient = null;
const getRedisClient = () => {
    if (redisClient)
        return redisClient;
    const url = process.env.REDIS_URL;
    if (!url) {
        throw new Error("REDIS_URL is not defined in environment variables");
    }
    const client = (0, redis_1.createClient)({ url });
    // 🔍 Observability: basic lifecycle logs
    client.on("connect", () => {
        console.log("🟡 Redis: connecting…");
    });
    client.on("ready", () => {
        console.log("✅ Redis: connected & ready");
    });
    client.on("reconnecting", () => {
        console.warn("♻️ Redis: reconnecting…");
    });
    client.on("end", () => {
        console.warn("🛑 Redis: connection closed");
    });
    client.on("error", (err) => {
        console.error("❌ Redis Client Error:", err);
    });
    // connect once, reuse forever
    client.connect().catch((err) => {
        console.error("❌ Failed to connect to Redis:", err);
    });
    redisClient = client;
    return client;
};
exports.getRedisClient = getRedisClient;
// 📴 Graceful shutdown helper
const disconnectRedis = async () => {
    if (!redisClient)
        return;
    try {
        console.log("👋 Gracefully shutting down Redis client…");
        await redisClient.quit();
        console.log("✅ Redis client shut down successfully");
    }
    catch (err) {
        console.error("❌ Error during Redis shutdown:", err);
    }
    finally {
        redisClient = null;
    }
};
exports.disconnectRedis = disconnectRedis;
