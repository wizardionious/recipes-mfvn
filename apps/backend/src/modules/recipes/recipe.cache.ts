import type { RecipeQuery } from "@recipes/shared";
import { hashFilters } from "@/common/utils/cache.js";

export const recipeCache = {
  keys: {
    byId: (id: string) => `id:${id}`,
    list: (filters: RecipeQuery) =>
      `list:${filters.page}:${filters.limit}:${hashFilters({
        categoryId: filters.categoryId,
        difficulty: filters.difficulty,
        sort: filters.sort,
      })}`,
    listPattern: () => "list:*",
    allPattern: () => "*",
  },
  ttl: {
    byId: 600,
    list: 120,
  },
} as const;
