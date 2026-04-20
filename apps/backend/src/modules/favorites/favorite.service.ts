import type { Paginated, PaginationQuery, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type {
  DefaultInitiator,
  InitiatedMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { extractTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import { buildFindByUserPipeline } from "@/modules/favorites/favorite.pipeline.js";
import type {
  RecipeDocumentPopulated,
  RecipeModelType,
} from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";

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
  favoriteModel: FavoriteModelType,
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

      await favoriteModel.create({ user: initiator.id, recipe: recipeId });
      return { favorited: true };
    },

    remove: async (recipeId, { initiator }) => {
      await validateUser(initiator.id);
      await validateRecipe(recipeId);

      await favoriteModel.findOneAndDelete({
        user: initiator.id,
        recipe: recipeId,
      });
      return { favorited: false };
    },

    findByUser: async (userId, params) => {
      await validateUser(userId);

      const { page, limit } = params.query;

      const [favorites, total] = extractTotalCountResult(
        await favoriteModel.aggregate<
          WithTotalCountResult<{ recipe: RecipeDocumentPopulated }>
        >(buildFindByUserPipeline(userId, params)),
      );

      const items = favorites
        .map((fav) => fav.recipe)
        .filter((recipe) => recipe != null)
        .map((recipe) => toRecipe(recipe, true));

      return withPagination(items, total, page, limit);
    },

    isFavorited: async (recipeId, { initiator }) => {
      return !!(await favoriteModel.exists({
        user: initiator.id,
        recipe: recipeId,
      }));
    },
  };
}
