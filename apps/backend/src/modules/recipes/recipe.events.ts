import type { CacheService } from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";

export function registerRecipeEventHandlers(
  bus: TypedEmitter,
  deps: {
    recipeCache: CacheService;
    log: Logger;
  },
) {
  bus.on("category:deleted", () => deps.recipeCache.deletePattern("*"));
  bus.on("recipe-rating:created", () => deps.recipeCache.deletePattern("*"));
  bus.on("recipe-rating:updated", () => deps.recipeCache.deletePattern("*"));
  bus.on("recipe-rating:deleted", () => deps.recipeCache.deletePattern("*"));
}
