"use strict";
// src/utils/url-cache.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_DEFAULT_TTL_SECONDS = void 0;
exports.buildCacheKey = buildCacheKey;
exports.isEmptyCache = isEmptyCache;
exports.isExpiredDate = isExpiredDate;
exports.isExpiredString = isExpiredString;
exports.computeTtlSeconds = computeTtlSeconds;
exports.buildCachePayloadFromUrlEntry = buildCachePayloadFromUrlEntry;
exports.cacheUrl = cacheUrl;
exports.handleCacheHitFromRedis = handleCacheHitFromRedis;
exports.incrementClicks = incrementClicks;
const url_repo_1 = require("../../repositories/url-repo");
const response_message_1 = require("../response/response-message");
exports.REDIS_DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24h
// ——— Core helpers ———
function buildCacheKey(prefix, shortCode) {
    return `${prefix}${shortCode}`;
}
function isEmptyCache(cached) {
    return !cached || Object.keys(cached).length === 0;
}
function isExpiredDate(expiresAt) {
    if (!expiresAt)
        return false;
    return expiresAt < new Date();
}
function isExpiredString(expiresAtStr) {
    if (!expiresAtStr)
        return false;
    const expiresAt = new Date(expiresAtStr);
    if (Number.isNaN(expiresAt.getTime()))
        return false;
    return expiresAt < new Date();
}
function computeTtlSeconds(expiresAt) {
    if (!expiresAt)
        return exports.REDIS_DEFAULT_TTL_SECONDS;
    const secondsLeft = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    // A minimum TTL so the entry doesn’t vanish instantly
    return Math.max(60, secondsLeft);
}
function buildCachePayloadFromUrlEntry(urlEntry) {
    return {
        guid: typeof urlEntry.guid === "string"
            ? urlEntry.guid
            : urlEntry.guid?.toString() ?? "",
        originalUrl: typeof urlEntry.originalUrl === "string"
            ? urlEntry.originalUrl
            : urlEntry.originalUrl.toString(),
        expiresAt: urlEntry.expiresAt ? urlEntry.expiresAt.toISOString() : "",
        isPremium: urlEntry.isPremium ? "true" : "false",
        clicks: urlEntry.clicks.toString(),
    };
}
async function cacheUrl(redis, cacheKey, payload, ttlSeconds) {
    await redis.hSet(cacheKey, payload);
    await redis.expire(cacheKey, ttlSeconds);
}
// ——— Cache-hit handling ———
async function handleCacheHitFromRedis({ cached, cacheKey, shortCode, redis, }) {
    const originalUrl = cached.originalUrl;
    const expiresAtStr = cached.expiresAt;
    const isPremium = cached.isPremium === "true"; // kept for future use
    const guid = cached.guid; // kept for future use
    // Expiry check (cache)
    if (isExpiredString(expiresAtStr)) {
        await safeDel(redis, cacheKey);
        throw new Error(response_message_1.DATA_EXPIRED);
    }
    if (!originalUrl) {
        // Corrupted cache entry - safety
        await safeDel(redis, cacheKey);
        throw new Error(response_message_1.BAD_REQUEST);
    }
    // Increment clicks in Redis + DB (fire-and-forget)
    await incrementClicks(redis, cacheKey, shortCode);
    return originalUrl;
}
async function incrementClicks(redis, cacheKey, shortCode) {
    console.log("🔥 incrementClicks called", { cacheKey, shortCode });
    // Redis
    try {
        const newClicks = await redis.hIncrBy(cacheKey, "clicks", 1);
        console.log("📈 Redis clicks after hIncrBy:", newClicks);
    }
    catch (err) {
        console.error("❌ Failed to increment clicks in Redis:", err);
    }
    // DB
    if (!shortCode)
        return;
    try {
        const result = await url_repo_1.UrlRepo.incrementClicksByShortCode(shortCode);
        console.log("📊 DB increment result for", shortCode, "->", result);
    }
    catch (err) {
        console.error("❌ Failed to increment clicks in DB from cache hit:", err);
    }
}
async function safeDel(redis, cacheKey) {
    try {
        await redis.del(cacheKey);
    }
    catch (err) {
        console.error("Failed to delete key from Redis:", { cacheKey, err });
    }
}
