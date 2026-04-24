import type { CategoryQuery } from "@recipes/shared";
import { hashFilters } from "@/common/utils/cache.js";

export const categoryCache = {
  keys: {
    list: (filters: CategoryQuery) =>
      `list:${hashFilters({
        sort: filters.sort,
      })}`,
    allPattern: () => "*",
  },
  ttl: {
    list: 3600,
  },
} as const;
