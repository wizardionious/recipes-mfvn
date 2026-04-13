import { Redis } from "ioredis";
import type { CacheService } from "./cache.service.js";

export interface RedisCacheOptions {
  url: string;
  defaultTTL?: number;
  keyPrefix?: string;
}

export function createRedisCache(options: RedisCacheOptions): CacheService {
  const { url, defaultTTL = 300, keyPrefix = "" } = options;

  const redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  function prefixed(key: string): string {
    return keyPrefix + key;
  }

  return {
    async get<T extends {}>(key: string): Promise<T | undefined> {
      const raw = await redis.get(prefixed(key));
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    },

    async set<T extends {}>(
      key: string,
      value: T,
      ttlSeconds?: number,
    ): Promise<void> {
      const ttl = ttlSeconds ?? defaultTTL;
      await redis.setex(prefixed(key), ttl, JSON.stringify(value));
    },

    async delete(key: string): Promise<void> {
      await redis.del(prefixed(key));
    },

    async deletePattern(pattern: string): Promise<void> {
      const fullPattern = prefixed(pattern);
      let cursor = "0";

      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          fullPattern,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    },

    async flush(): Promise<void> {
      await redis.flushdb();
    },

    async close(): Promise<void> {
      await this.flush();
      await redis.quit();
    },
  };
}
