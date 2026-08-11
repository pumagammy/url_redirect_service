// src/config/redis.ts
import { createClient, RedisClientType } from "redis";
import { RedisLike } from "../utils/url-cache";

let redisClient: (RedisClientType & RedisLike) | null = null;

export const getRedisClient = (): RedisClientType & RedisLike => {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;
  console.log("redis url===>",url)


  if (!url) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  const client = createClient({ url }) as RedisClientType & RedisLike;

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

// 📴 Graceful shutdown helper
export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) return;

  try {
    console.log("👋 Gracefully shutting down Redis client…");
    await redisClient.quit();
    console.log("✅ Redis client shut down successfully");
  } catch (err) {
    console.error("❌ Error during Redis shutdown:", err);
  } finally {
    redisClient = null;
  }
};
