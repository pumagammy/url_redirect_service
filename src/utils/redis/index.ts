


/**
 * Run a Redis operation with simple retry logic.
 */
export async function withRedisRetry<T>(
  operationName: string,
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 100 } = options;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      if (attempt > 0) {
        console.warn(
          `⚠️ Redis retry [${operationName}] attempt ${attempt}/${maxRetries}`
        );
      }
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;

      if (attempt > maxRetries) {
        console.error(
          `❌ Redis operation failed after ${maxRetries} retries: ${operationName}`,
          err
        );
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
export async function withRedisTiming<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    
    const result = await fn();
    const duration = Date.now() - start;
    console.log(`⏱️ Redis [${operationName}] took ${duration}ms`);
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(
      `⏱️❌ Redis [${operationName}] failed after ${duration}ms`,
      err
    );
    throw err;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
