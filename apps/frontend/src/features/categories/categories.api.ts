import type { Category, SearchCategoryQuery } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function getCategories(
  filters: Partial<SearchCategoryQuery> = {},
): Promise<Category[]> {
  return apiClient<Category[]>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
