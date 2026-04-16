import type { SearchCategoryQuery } from "@recipes/shared";
import { hashFilters } from "@/common/utils/cache.js";

export const categoryCache = {
  keys: {
    list: (filters: SearchCategoryQuery) =>
      `categories:list:${hashFilters({
        sort: filters.sort,
      })}`,
    allPattern: () => "categories:*",
  },
  ttl: {
    list: 3600,
  },
} as const;
