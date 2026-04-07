import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { PaginationQuery } from "@/common/schemas.js";
import type {
  DefaultInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type { FavoriteModelType } from "@/modules/favorites/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface FavoriteService {
  add(recipeId: string, params: DefaultInitiator): Promise<{ favorited: true }>;
  remove(
    recipeId: string,
    params: DefaultInitiator,
  ): Promise<{ favorited: false }>;
  findByUser(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<Recipe>>;
  isFavorited(recipeId: string, params: DefaultInitiator): Promise<boolean>;
}

export function createFavoriteService(
  favoriteModel: FavoriteModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): FavoriteService {
  async function validateUser(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
  }
  async function validateRecipe(recipeId: string): Promise<void> {
    if (!isValidObjectId(recipeId)) {
      throw new BadRequestError("Invalid recipe ID");
    }

    const recipeExists = await recipeModel.exists({ _id: recipeId });
    if (!recipeExists) {
      throw new NotFoundError("Recipe not found");
    }
  }

  return {
    add: async (recipeId, { initiator }) => {
      await validateUser(initiator);
      await validateRecipe(recipeId);

      await favoriteModel.create({ user: initiator, recipe: recipeId });
      return { favorited: true };
    },

    remove: async (recipeId, { initiator }) => {
      await validateUser(initiator);
      await validateRecipe(recipeId);

      await favoriteModel.findOneAndDelete({
        user: initiator,
        recipe: recipeId,
      });
      return { favorited: false };
    },

    findByUser: async (userId, params) => {
      await validateUser(userId);

      const { page, limit } = params.query;

      const [favorites, total] = await favoriteModel.findByUser(userId, params);
      if (!favorites) {
        return withPagination([], 0, page, limit);
      }

      const items = favorites
        .map((fav) => fav.recipe)
        .filter((recipe) => recipe != null)
        .map((recipe) => toRecipe(recipe, true));

      return withPagination(items, total, page, limit);
    },

    isFavorited: async (recipeId, { initiator }) => {
      return !!(await favoriteModel.exists({
        user: initiator,
        recipe: recipeId,
      }));
    },
  };
}
