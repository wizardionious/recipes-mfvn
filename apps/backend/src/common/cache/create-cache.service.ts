import type { CacheService } from "./cache.service.js";
import type { MemoryCacheOptions } from "./memory-cache.service.js";
import { createMemoryCache } from "./memory-cache.service.js";
import type { RedisCacheOptions } from "./redis-cache.service.js";
import { createRedisCache } from "./redis-cache.service.js";

export type CacheBackend = "memory" | "redis";

export interface CacheFactoryOptions {
  backend?: CacheBackend;
  redis?: RedisCacheOptions;
  memory?: MemoryCacheOptions;
}

export async function createCacheService(
  options: CacheFactoryOptions = {},
): Promise<CacheService> {
  const { backend = "memory" } = options;

  if (backend === "redis" && options.redis?.url) {
    try {
      const cache = createRedisCache(options.redis);
      console.log("✅ Redis cache connected");
      return cache;
    } catch (error) {
      console.warn(
        "⚠️  Redis unavailable, falling back to in-memory cache:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return createMemoryCache(options.memory);
}
