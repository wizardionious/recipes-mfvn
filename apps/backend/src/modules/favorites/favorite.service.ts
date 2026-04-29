import type { Paginated, PaginationQuery, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type {
  DefaultInitiator,
  InitiatedMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toRecipe } from "@/common/utils/mongo.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";
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
  ): Promise<Paginated<Recipe>>;
  isFavorited(
    recipeId: string,
    params: InitiatedMethodParams,
  ): Promise<boolean>;
}

export function createFavoriteService(
  repository: FavoriteRepository,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): FavoriteService {
  async function validateUser(id: string): Promise<void> {
    assertValidId(id, "User");
    await assertExists(userModel, id);
  }

  async function validateRecipe(id: string): Promise<void> {
    assertValidId(id, "Recipe");
    await assertExists(recipeModel, id);
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
