import type { CacheService } from "./cache.service.js";

export function createNamespacedCache(
  prefix: string,
  cache: CacheService,
): CacheService {
  return {
    async get<T extends {}>(key: string): Promise<T | undefined> {
      return cache.get<T>(`${prefix}:${key}`);
    },

    async set<T extends {}>(
      key: string,
      value: T,
      ttlSeconds?: number,
    ): Promise<void> {
      return cache.set(`${prefix}:${key}`, value, ttlSeconds);
    },

    async delete(key: string): Promise<void> {
      return cache.delete(`${prefix}:${key}`);
    },

    async deletePattern(pattern: string): Promise<void> {
      return cache.deletePattern(`${prefix}:${pattern}`);
    },

    flush: cache.flush,
    close: cache.close,
  };
}
