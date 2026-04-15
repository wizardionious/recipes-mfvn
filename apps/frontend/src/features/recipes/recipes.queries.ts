import type { UpdateRecipeBody } from "@recipes/shared";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import type { RecipeFilters } from "./recipes.api";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  updateRecipe,
} from "./recipes.api";

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (query: RecipeFilters) => [...recipeKeys.lists(), query] as const,
  detail: (id: string) => [...recipeKeys.all, id] as const,
  infinite: (query: RecipeFilters) =>
    [...recipeKeys.list(query), "infinite"] as const,
} as const;

/**
 * Get recipes with the given filters.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function useRecipes(filters: MaybeRef<RecipeFilters>) {
  return useQuery({
    queryKey: recipeKeys.list(toValue(filters)),
    queryFn: () => getRecipes(toValue(filters)),
  });
}

/**
 * Get recipes with the given filters using @tanstack/vue-query's infinite query.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function useInfiniteRecipes(
  filters: MaybeRef<Omit<RecipeFilters, "page">>,
) {
  return useInfiniteQuery({
    queryKey: recipeKeys.infinite(toValue(filters)),
    queryFn: ({ pageParam }) =>
      getRecipes({ ...toValue(filters), page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

/**
 * Get recipe by ID.
 *
 * @param id - recipe id.
 * @returns Recipe.
 */
export function useRecipe(id: MaybeRef<string>) {
  return useQuery({
    queryKey: recipeKeys.detail(toValue(id)),
    queryFn: () => getRecipe(toValue(id)),
    enabled: () => !!toValue(id),
  });
}

/**
 * Create a new recipe.
 *
 * @param body - recipe data.
 * @returns Created recipe.
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Update a recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - recipe data.
 * @returns Updated recipe.
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRecipeBody }) =>
      updateRecipe(id, body),

    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
