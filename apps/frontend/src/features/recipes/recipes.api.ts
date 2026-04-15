import type {
  CreateRecipeBody,
  Difficulty,
  Paginated,
  Recipe,
  UpdateRecipeBody,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export interface RecipeFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  difficulty?: Difficulty;
  isFavorited?: boolean;
  sort?: string;
}

/**
 * Retrieve recipes with the given filters.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function getRecipes(
  filters: RecipeFilters = {},
): Promise<Paginated<Recipe>> {
  return apiClient<Paginated<Recipe>>("/api/recipes", {
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
export function getRecipe(id: string): Promise<Recipe> {
  return apiClient<Recipe>(`/api/recipes/${id}`);
}

/**
 * Create a new recipe.
 *
 * @param body - recipe data.
 * @returns Created recipe.
 */
export function createRecipe(body: CreateRecipeBody): Promise<Recipe> {
  return apiClient<Recipe>("/api/recipes", {
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
export function updateRecipe(
  id: string,
  body: UpdateRecipeBody,
): Promise<Recipe> {
  return apiClient<Recipe>(`/api/recipes/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function deleteRecipe(id: string): Promise<void> {
  return apiClient<void>(`/api/recipes/${id}`, {
    method: "DELETE",
  });
}
