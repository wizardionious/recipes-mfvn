import type {
  Paginated,
  PaginationQuery,
  RecipeWithComputed,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type {
  DefaultInitiator,
  InitiatedMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toRecipe } from "@/common/utils/mongo.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import type { FavoriteRepository } from "./favorite.repository.js";

export interface FavoriteService {
  add(
    recipeId: string,
    params: InitiatedMethodParams,
  ): Promise<{ favorited: true }>;
  remove(
    recipeId: string,
    params: InitiatedMethodParams,
  ): Promise<{ favorited: false }>;
  findByUser(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<RecipeWithComputed>>;
  isFavorited(
    recipeId: string,
    params: InitiatedMethodParams,
  ): Promise<boolean>;
}

export function createFavoriteService(
  repository: FavoriteRepository,
  recipeRepository: RecipeRepository,
  userRepository: UserRepository,
): FavoriteService {
  async function validateUser(id: string): Promise<void> {
    assertValidId(id, "User");
    await assertExists(userRepository, id);
  }

  async function validateRecipe(id: string): Promise<void> {
    assertValidId(id, "Recipe");
    await assertExists(recipeRepository, id);
  }

  return {
    add: async (recipeId, { initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      await repository.create({ user: initiator.id, recipe: recipeId });
      return { favorited: true };
    },

    remove: async (recipeId, { initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      await repository.delete({ user: initiator.id, recipe: recipeId });
      return { favorited: false };
    },

    findByUser: async (userId, { query, initiator }) => {
      await validateUser(userId);

      const [favoriteRecipes, total] = await repository.findByUser(userId, {
        query,
        initiator,
      });

      const result = favoriteRecipes.map((recipe) => toRecipe(recipe, true));

      return withPagination(result, total, query.page, query.limit);
    },

    isFavorited: async (recipeId, { initiator }) => {
      return repository.exists({ user: initiator.id, recipe: recipeId });
    },
  };
}
