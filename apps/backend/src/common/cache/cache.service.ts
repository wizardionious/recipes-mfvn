/**
 * Cache service interface.
 *
 * Cache service is responsible for storing and retrieving data from a cache.
 * It provides methods for setting, getting, deleting, and flushing cache.
 */
export interface CacheService {
  get<T extends {}>(key: string): Promise<T | undefined>;
  set<T extends {}>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}
