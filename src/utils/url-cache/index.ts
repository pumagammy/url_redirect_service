// src/utils/url-cache.ts

import { UrlRepo } from "../../repositories/url-repo";
import { BAD_REQUEST, DATA_EXPIRED } from "../response/response-message";


export const REDIS_DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24h

// ——— Types to keep helpers loosely typed but still structured ———
export interface UrlEntryLike {
  guid?: { toString(): string } | string;
  originalUrl: { toString(): string } | string;
  expiresAt?: Date | null;
  isPremium?: boolean;
  clicks: number;
}

export interface RedisLike {
  hGetAll(key: string): Promise<Record<string, string>>;
  hSet(key: string, value: Record<string, string>): Promise<void>;
  hIncrBy(key: string, field: string, increment: number): Promise<void>;
  expire(key: string, ttl: number): Promise<void>;
  del(key: string): Promise<void>;
}

// ——— Core helpers ———

export function buildCacheKey(prefix: string, shortCode: string): string {
  return `${prefix}${shortCode}`;
}

export function isEmptyCache(cached: Record<string, string>): boolean {
  return !cached || Object.keys(cached).length === 0;
}

export function isExpiredDate(expiresAt?: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date();
}

export function isExpiredString(expiresAtStr?: string): boolean {
  if (!expiresAtStr) return false;

  const expiresAt = new Date(expiresAtStr);
  if (Number.isNaN(expiresAt.getTime())) return false;

  return expiresAt < new Date();
}

export function computeTtlSeconds(expiresAt?: Date | null): number {
  if (!expiresAt) return REDIS_DEFAULT_TTL_SECONDS;

  const secondsLeft = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

  // A minimum TTL so the entry doesn’t vanish instantly
  return Math.max(60, secondsLeft);
}

export function buildCachePayloadFromUrlEntry(
  urlEntry: UrlEntryLike
): Record<string, string> {
  return {
    guid:
      typeof urlEntry.guid === "string"
        ? urlEntry.guid
        : urlEntry.guid?.toString() ?? "",
    originalUrl:
      typeof urlEntry.originalUrl === "string"
        ? urlEntry.originalUrl
        : urlEntry.originalUrl.toString(),
    expiresAt: urlEntry.expiresAt ? urlEntry.expiresAt.toISOString() : "",
    isPremium: urlEntry.isPremium ? "true" : "false",
    clicks: urlEntry.clicks.toString(),
  };
}

export async function cacheUrl(
  redis: RedisLike,
  cacheKey: string,
  payload: Record<string, string>,
  ttlSeconds: number
): Promise<void> {
  await redis.hSet(cacheKey, payload);
  await redis.expire(cacheKey, ttlSeconds);
}

// ——— Cache-hit handling ———

export async function handleCacheHitFromRedis({
  cached,
  cacheKey,
  shortCode,
  redis,
}: {
  cached: Record<string, string>;
  cacheKey: string;
  shortCode: string;
  redis: RedisLike;
}): Promise<string> {
  const originalUrl = cached.originalUrl;
  const expiresAtStr = cached.expiresAt;
  const isPremium = cached.isPremium === "true"; // kept for future use
  const guid = cached.guid; // kept for future use

  // Expiry check (cache)
  if (isExpiredString(expiresAtStr)) {
    await safeDel(redis, cacheKey);
    throw new Error(DATA_EXPIRED);
  }

  if (!originalUrl) {
    // Corrupted cache entry - safety
    await safeDel(redis, cacheKey);
    throw new Error(BAD_REQUEST);
  }

  // Increment clicks in Redis + DB (fire-and-forget)
  await incrementClicks(redis, cacheKey, shortCode);

  return originalUrl;
}



export async function incrementClicks(
  redis: RedisLike,
  cacheKey: string,
  shortCode: string
): Promise<void> {
  console.log("🔥 incrementClicks called", { cacheKey, shortCode });

  // Redis
  try {
    const newClicks = await redis.hIncrBy(cacheKey, "clicks", 1);
    console.log("📈 Redis clicks after hIncrBy:", newClicks);
  } catch (err) {
    console.error("❌ Failed to increment clicks in Redis:", err);
  }

  // DB
  if (!shortCode) return;

  try {
    const result = await UrlRepo.incrementClicksByShortCode(shortCode);
    console.log("📊 DB increment result for", shortCode, "->", result);
  } catch (err) {
    console.error("❌ Failed to increment clicks in DB from cache hit:", err);
  }
}


async function safeDel(redis: RedisLike, cacheKey: string): Promise<void> {
  try {
    await redis.del(cacheKey);
  } catch (err) {
    console.error("Failed to delete key from Redis:", { cacheKey, err });
  }
}
