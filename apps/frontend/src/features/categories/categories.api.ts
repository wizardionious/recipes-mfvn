import type { Category } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export function getCategories(): Promise<Category[]> {
  return apiClient<Category[]>("/api/categories");
}
