"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
// src/services/url-service.ts
const redis_1 = require("../config/redis");
const url_repo_1 = require("../repositories/url-repo");
const redis_2 = require("../utils/redis");
const response_message_1 = require("../utils/response/response-message");
const url_cache_1 = require("../utils/url-cache");
const REDIS_KEY_PREFIX = "shorturl:";
exports.UrlService = {
    async redirectToOriginal(shortCode) {
        console.log("shortcode", shortCode);
        const redis = (0, redis_1.getRedisClient)();
        const cacheKey = (0, url_cache_1.buildCacheKey)(REDIS_KEY_PREFIX, shortCode);
        try {
            // 1) Try Redis first (with timing + retry)
            const cached = await (0, redis_2.withRedisRetry)("hGetAll shorturl cache", () => (0, redis_2.withRedisTiming)("hGetAll shorturl cache", () => redis.hGetAll(cacheKey)));
            if (!(0, url_cache_1.isEmptyCache)(cached)) {
                return await (0, url_cache_1.handleCacheHitFromRedis)({
                    cached,
                    cacheKey,
                    shortCode,
                    redis,
                });
            }
            // 2) Cache miss → DB
            const urlEntry = await url_repo_1.UrlRepo.findByShortCode(shortCode);
            if (!urlEntry) {
                throw new Error(response_message_1.BAD_REQUEST);
            }
            if ((0, url_cache_1.isExpiredDate)(urlEntry.expiresAt)) {
                throw new Error(response_message_1.DATA_EXPIRED);
            }
            urlEntry.clicks = (urlEntry.clicks ?? 0) + 1;
            console.log("📈 Incrementing DB clicks to", urlEntry.clicks, "for shortCode:", shortCode);
            await url_repo_1.UrlRepo.save(urlEntry);
            // 3) Cache in Redis (also with retry, optional timing)
            const payload = (0, url_cache_1.buildCachePayloadFromUrlEntry)(urlEntry);
            const ttlSeconds = (0, url_cache_1.computeTtlSeconds)(urlEntry.expiresAt ?? null);
            await (0, redis_2.withRedisRetry)("cacheUrl shorturl", () => (0, redis_2.withRedisTiming)("cacheUrl shorturl", () => (0, url_cache_1.cacheUrl)(redis, cacheKey, payload, ttlSeconds)));
            return String(urlEntry.originalUrl);
        }
        catch (err) {
            console.error("Error in redirectToOriginal:", err);
            if (err instanceof Error) {
                if (err.message === response_message_1.BAD_REQUEST || err.message === response_message_1.DATA_EXPIRED) {
                    throw err;
                }
            }
            throw new Error(response_message_1.INTERNAL_SERVER_ERROR_MESSAGE);
        }
    },
};
