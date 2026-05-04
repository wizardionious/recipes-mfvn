import type { CategoryQuery } from "@recipes/shared";
import { hashFilters } from "@/common/utils/cache.js";

export const categoryCache = {
  keys: {
    list: (filters: CategoryQuery) =>
      `list:${hashFilters({
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
      })}`,
    allPattern: () => "*",
  },
  ttl: {
    list: 3600,
  },
} as const;
