import type { Category, CategoryQuery } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function getCategories(
  filters: Partial<CategoryQuery> = {},
): Promise<Category[]> {
  return apiClient<Category[]>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
