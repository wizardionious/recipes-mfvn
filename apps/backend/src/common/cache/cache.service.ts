/**
 * Cache service interface.
 *
 * Cache service is responsible for storing and retrieving data from a cache.
 * It provides methods for setting, getting, deleting, flushing cache, and closing the cache service.
 */
export interface CacheService {
  /**
   * Gets the value of the entry with the given key.
   *
   * @param key - The key of the entry to get.
   * @returns The value of the entry with the given key, or `undefined` if the entry does not exist.
   */
  get<T extends {}>(key: string): Promise<T | undefined>;

  /**
   * Sets the value of the entry with the given key.
   *
   * @param key - The key of the entry to set.
   * @param ttlSeconds - The time-to-live (TTL) in seconds for the entry. If not provided, the entry will not expire. If the cache service has a default TTL value set, that value will be used. If both parameters are specified, this parameter will be used.
   */
  set<T extends {}>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Deletes the entry with the given key.
   */
  delete(key: string): Promise<void>;

  /**
   * Deletes all entries that match the given pattern.
   *
   * The pattern is a glob pattern that matches keys. For example, to delete all entries with the prefix "user:", you can use the pattern "user:*".
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Flushes the cache and removes all entries.
   */
  flush(): Promise<void>;

  /**
   * Closes the cache service and releases any resources it holds.
   */
  close(): Promise<void>;
}
