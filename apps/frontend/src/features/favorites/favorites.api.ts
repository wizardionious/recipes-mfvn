import type { Paginated, Recipe } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

/**
 * Check if recipe with the given id is favorited by the current user.
 *
 * @param id - recipe id.
 * @returns \{favorited: boolean\} if the recipe is favorited.
 */
export function isFavorited(id: string): Promise<boolean> {
  return apiClient<boolean>(`/api/recipes/${id}/favorite`, {
    method: "GET",
  });
}

/**
 * Add a recipe with the given id to the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: true\} if the recipe was added to the user's favorites.
 */
export function addFavorite(id: string): Promise<{ favorited: true }> {
  return apiClient<{ favorited: true }>(`/api/recipes/${id}/favorite`, {
    method: "POST",
  });
}

/**
 * Remove a recipe with the given id from the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: false\} if the recipe was removed from the user's favorites.
 */
export function removeFavorite(id: string): Promise<{ favorited: false }> {
  return apiClient<{ favorited: false }>(`/api/recipes/${id}/favorite`, {
    method: "DELETE",
  });
}

/**
 * @todo Implement retriving favorites for the user other than the current one.
 *
 * Get recipes favorited by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function getUserFavorites(
  _user: string,
  { page = 1, limit = 20 },
): Promise<Paginated<Recipe>> {
  return apiClient<Paginated<Recipe>>("/api/users/me/favorites", {
    query: { page, limit },
  });
}
