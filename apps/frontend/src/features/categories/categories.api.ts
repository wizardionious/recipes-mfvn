import type { CategoryQuery, CategoryWithComputed } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function getCategories(
  filters: Partial<CategoryQuery> = {},
): Promise<CategoryWithComputed[]> {
  return apiClient<CategoryWithComputed[]>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
