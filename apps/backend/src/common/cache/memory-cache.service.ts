import { LRUCache } from "lru-cache";
import type { CacheService } from "./cache.service.js";

export interface MemoryCacheOptions {
  maxSize?: number;
  defaultTTL?: number;
}

/**
 * Creates a new memory cache service.
 *
 * @param options.maxSize - The maximum number of items in the cache. Defaults to 1000.
 * @param options.defaultTtl - The default TTL for cache items in seconds. Defaults to 300.
 * @returns A new memory cache service.
 */
export function createMemoryCache(
  options: MemoryCacheOptions = {},
): CacheService {
  const { maxSize = 1000, defaultTTL = 300 } = options;

  const cache = new LRUCache<string, NonNullable<unknown>>({
    max: maxSize,
    ttl: defaultTTL * 1000,
    updateAgeOnGet: true,
  });

  return {
    async get<T extends {}>(key: string): Promise<T | undefined> {
      return cache.get(key) as T | undefined;
    },

    async set<T extends {}>(
      key: string,
      value: T,
      ttlSeconds?: number,
    ): Promise<void> {
      cache.set(key, value, {
        ttl: (ttlSeconds ?? defaultTTL) * 1000,
      });
    },

    async delete(key: string): Promise<void> {
      cache.delete(key);
    },

    async deletePattern(pattern: string): Promise<void> {
      const regex = new RegExp(
        `^${pattern.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
      );
      for (const key of cache.keys()) {
        if (regex.test(key)) {
          cache.delete(key);
        }
      }
    },

    async flush(): Promise<void> {
      cache.clear();
    },

    async close(): Promise<void> {
      await this.flush();
      // Nothing to close for in-memory cache
    },
  };
}
