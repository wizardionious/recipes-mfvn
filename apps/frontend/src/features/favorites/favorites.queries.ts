import type { PaginationQuery, Recipe } from "@recipes/shared";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeKeys } from "@/features/recipes/recipes.queries";
import { addFavorite, getUserFavorites, removeFavorite } from "./favorites.api";

const favoritesKeys = {
  all: ["favorites"] as const,
  byUser: (user: string, query: PaginationQuery) =>
    [...favoritesKeys.all, user, query] as const,
};

/**
 * Add recipe to favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: true\} if the recipe was added to the user's favorites.
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFavorite,

    onSuccess: (_, id) => {
      queryClient.setQueryData<Recipe>(recipeKeys.detail(id), (old) =>
        old ? { ...old, isFavorited: true } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * Remove recipe from favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: false\} if the recipe was removed from the user's favorites.
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavorite,

    onSuccess: (_, id) => {
      queryClient.setQueryData<Recipe>(recipeKeys.detail(id), (old) =>
        old ? { ...old, isFavorited: false } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * @todo Implement retriving favorites for the user other than the current one.
 *
 * Get recipes favorited by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function useUserFavorites(
  user: string = "me",
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };

  return {
    queryKey: favoritesKeys.byUser(user, query),
    queryFn: () => getUserFavorites(user, query),
  };
}
