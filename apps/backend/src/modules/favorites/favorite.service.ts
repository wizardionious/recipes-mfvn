import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type {
  FavoriteModelType,
  FavoriteQuery,
} from "@/modules/favorites/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface FavoriteService {
  add(userId: string, recipeId: string): Promise<{ favorited: true }>;
  remove(userId: string, recipeId: string): Promise<{ favorited: false }>;
  findByUser(userId: string, query: FavoriteQuery): Promise<Paginated<Recipe>>;
  isFavorited(userId: string, recipeId: string): Promise<boolean>;
}

export function createFavoriteService(
  favoriteModel: FavoriteModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): FavoriteService {
  async function validateUser(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      throw new AppError("User not found", 404);
    }
  }
  async function validateRecipe(recipeId: string): Promise<void> {
    if (!isValidObjectId(recipeId)) {
      throw new AppError("Invalid recipe ID", 400);
    }

    const recipeExists = await recipeModel.exists({ _id: recipeId });
    if (!recipeExists) {
      throw new AppError("Recipe not found", 404);
    }
  }

  return {
    add: async (userId, recipeId) => {
      await validateUser(userId);
      await validateRecipe(recipeId);

      await favoriteModel.create({ user: userId, recipe: recipeId });
      return { favorited: true };
    },

    remove: async (userId, recipeId) => {
      await validateUser(userId);
      await validateRecipe(recipeId);

      await favoriteModel.findOneAndDelete({ user: userId, recipe: recipeId });
      return { favorited: false };
    },

    findByUser: async (userId, query) => {
      await validateUser(userId);

      const { page, limit } = query;

      const [favorites, total] = await favoriteModel.findByUser(userId, query);
      if (!favorites) {
        return withPagination([], 0, page, limit);
      }

      const items = favorites
        .map((fav) => fav.recipe)
        .filter((recipe) => recipe != null)
        .map((recipe) => toRecipe(recipe, true));

      return withPagination(items, total, page, limit);
    },

    isFavorited: async (userId, recipeId) => {
      return !!(await favoriteModel.exists({ user: userId, recipe: recipeId }));
    },
  };
}
