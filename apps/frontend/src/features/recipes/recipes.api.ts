import type {
  CreateRecipeBody,
  Paginated,
  RecipeQuery,
  RecipeWithComputed,
  UpdateRecipeBody,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

/**
 * Retrieve recipes with the given filters.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function getRecipes(filters: Partial<RecipeQuery> = {}) {
  return apiClient<Paginated<RecipeWithComputed>>("/api/recipes", {
    query: {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      categoryId: filters.categoryId,
      difficulty: filters.difficulty,
      isFavorited: filters.isFavorited,
      sort: filters.sort,
    },
  });
}

/**
 * Retrieve a recipe with the given id.
 *
 * @param id - recipe id.
 * @returns Recipe.
 */
export function getRecipe(id: string) {
  return apiClient<RecipeWithComputed>(`/api/recipes/${id}`);
}

/**
 * Create a new recipe.
 *
 * @param body - recipe data.
 * @returns Created recipe.
 */
export function createRecipe(body: CreateRecipeBody) {
  return apiClient<RecipeWithComputed>("/api/recipes", {
    method: "POST",
    body,
  });
}

/**
 * Update a recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - recipe data.
 * @returns Updated recipe.
 */
export function updateRecipe(id: string, body: UpdateRecipeBody) {
  return apiClient<RecipeWithComputed>(`/api/recipes/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function deleteRecipe(id: string) {
  return apiClient<void>(`/api/recipes/${id}`, {
    method: "DELETE",
  });
}
