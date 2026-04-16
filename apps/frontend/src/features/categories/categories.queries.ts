import type { SearchCategoryQuery } from "@recipes/shared";
import { useQuery } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getCategories } from "./categories.api";

const categoryKeys = {
  all: ["categories"] as const,
};

/**
 * Get all categories.
 *
 * @returns List of categories.
 */
export function useCategories(
  filters: MaybeRef<Partial<SearchCategoryQuery>> = {},
) {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => getCategories(toValue(filters)),
    staleTime: 5 * 60 * 1000,
  });
}
