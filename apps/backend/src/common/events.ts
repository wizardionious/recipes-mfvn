import { EventEmitter } from "node:events";

export interface CacheEvents {
  "recipe:changed": () => void;
  "recipe:rated": (recipeId: string) => void;
  "category:changed": () => void;
}

export interface TypedEmitter extends EventEmitter {
  on<K extends keyof CacheEvents>(event: K, listener: CacheEvents[K]): this;
  off<K extends keyof CacheEvents>(event: K, listener: CacheEvents[K]): this;
  once<K extends keyof CacheEvents>(event: K, listener: CacheEvents[K]): this;
  emit<K extends keyof CacheEvents>(
    event: K,
    ...args: Parameters<CacheEvents[K]>
  ): boolean;
  removeAllListeners<K extends keyof CacheEvents>(event?: K): this;
}

export function createEventBus(): TypedEmitter {
  return new EventEmitter() as TypedEmitter;
}
