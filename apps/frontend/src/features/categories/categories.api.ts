import type {
  CategoryQuery,
  CategoryWithComputed,
  Paginated,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function getCategories(
  filters: Partial<CategoryQuery> = {},
): Promise<Paginated<CategoryWithComputed>> {
  return apiClient<Paginated<CategoryWithComputed>>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
