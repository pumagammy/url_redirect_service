// src/services/url-service.ts
import { getRedisClient } from "../config/redis";
import { UrlRepo } from "../repositories/url-repo";
import { withRedisRetry, withRedisTiming } from "../utils/redis";

import {
  BAD_REQUEST,
  DATA_EXPIRED,
  INTERNAL_SERVER_ERROR_MESSAGE,
} from "../utils/response/response-message";

import {
  buildCacheKey,
  isEmptyCache,
  isExpiredDate,
  buildCachePayloadFromUrlEntry,
  computeTtlSeconds,
  cacheUrl,
  handleCacheHitFromRedis,
} from "../utils/url-cache";



const REDIS_KEY_PREFIX = "shorturl:";

export const UrlService = {
  async redirectToOriginal(shortCode: string): Promise<string> {

    console.log("shortcode",shortCode)
    const redis = getRedisClient();
    const cacheKey = buildCacheKey(REDIS_KEY_PREFIX, shortCode);

    try {
      // 1) Try Redis first (with timing + retry)
      const cached = await withRedisRetry(
        "hGetAll shorturl cache",
        () =>
          withRedisTiming("hGetAll shorturl cache", () =>
            redis.hGetAll(cacheKey)
          )
      );

      if (!isEmptyCache(cached)) {
        return await handleCacheHitFromRedis({
          cached,
          cacheKey,
          shortCode,
          redis,
        });
      }

      // 2) Cache miss → DB
      const urlEntry = await UrlRepo.findByShortCode(shortCode);

      if (!urlEntry) {
        throw new Error(BAD_REQUEST);
      }

      if (isExpiredDate(urlEntry.expiresAt)) {
        throw new Error(DATA_EXPIRED);
      }

       urlEntry.clicks = (urlEntry.clicks ?? 0) + 1;
      console.log(
        "📈 Incrementing DB clicks to",
        urlEntry.clicks,
        "for shortCode:",
        shortCode
      );
      await UrlRepo.save(urlEntry);

      // 3) Cache in Redis (also with retry, optional timing)
      const payload = buildCachePayloadFromUrlEntry(urlEntry);
      const ttlSeconds = computeTtlSeconds(urlEntry.expiresAt ?? null);

      await withRedisRetry("cacheUrl shorturl", () =>
        withRedisTiming("cacheUrl shorturl", () =>
          cacheUrl(redis, cacheKey, payload, ttlSeconds)
        )
      );

      return String(urlEntry.originalUrl);
    } catch (err: any) {
      console.error("Error in redirectToOriginal:", err);

      if (err instanceof Error) {
        if (err.message === BAD_REQUEST || err.message === DATA_EXPIRED) {
          throw err;
        }
      }

      throw new Error(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  },
};
