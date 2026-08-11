"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRedisRetry = withRedisRetry;
exports.withRedisTiming = withRedisTiming;
/**
 * Run a Redis operation with simple retry logic.
 */
async function withRedisRetry(operationName, fn, options = {}) {
    const { maxRetries = 3, delayMs = 100 } = options;
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
        try {
            if (attempt > 0) {
                console.warn(`⚠️ Redis retry [${operationName}] attempt ${attempt}/${maxRetries}`);
            }
            return await fn();
        }
        catch (err) {
            lastError = err;
            attempt++;
            if (attempt > maxRetries) {
                console.error(`❌ Redis operation failed after ${maxRetries} retries: ${operationName}`, err);
                throw err;
            }
            await sleep(delayMs);
        }
    }
    // Should never hit here, but TS wants a return/throw
    throw lastError ?? new Error(`Redis operation failed: ${operationName}`);
}
/**
 * Wrap a Redis call to measure execution duration.
 */
async function withRedisTiming(operationName, fn) {
    const start = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - start;
        console.log(`⏱️ Redis [${operationName}] took ${duration}ms`);
        return result;
    }
    catch (err) {
        const duration = Date.now() - start;
        console.error(`⏱️❌ Redis [${operationName}] failed after ${duration}ms`, err);
        throw err;
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
