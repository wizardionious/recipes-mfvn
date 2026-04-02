import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import mongoose from "mongoose";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { UserModel } from "@/modules/users/user.model.js";
import type { FavoriteQuery } from "./favorite.schema.js";

export class FavoriteService {
  async add(userId: string, recipeId: string): Promise<{ favorited: true }> {
    await this.validateUser(userId);
    await this.validateRecipe(recipeId);

    await FavoriteModel.create({ user: userId, recipe: recipeId });
    return { favorited: true };
  }

  async remove(
    userId: string,
    recipeId: string,
  ): Promise<{ favorited: false }> {
    await this.validateUser(userId);
    await this.validateRecipe(recipeId);

    await FavoriteModel.findOneAndDelete({ user: userId, recipe: recipeId });
    return { favorited: false };
  }

  async findByUser(
    userId: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>> {
    await this.validateUser(userId);

    const { page, limit } = query;

    const [favorites, total] = await Promise.all([
      FavoriteModel.find({ user: userId })
        .select({ recipe: 1, createdAt: 1 })
        .populate({
          path: "recipe",
          match: { $or: [{ isPublic: true }, { author: userId }] },
          populate: [
            { path: "author", select: "name email" },
            { path: "category", select: "name slug" },
          ],
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      FavoriteModel.countDocuments({
        user: userId,
      }),
    ]);

    const items = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe != null)
      .map((recipe) => toRecipe(recipe as unknown as IRecipeDocument, true));

    return withPagination(items, total, page, limit);
  }

  async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    return !!(await FavoriteModel.exists({ user: userId, recipe: recipeId }));
  }

  private async validateUser(userId: string): Promise<void> {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userExtists = await UserModel.exists({ _id: userId });
    if (!userExtists) {
      throw new AppError("User not found", 404);
    }
  }

  private async validateRecipe(recipeId: string): Promise<void> {
    if (!mongoose.isValidObjectId(recipeId)) {
      throw new AppError("Invalid recipe ID", 400);
    }

    const recipeExtists = await RecipeModel.exists({ _id: recipeId });
    if (!recipeExtists) {
      throw new AppError("Recipe not found", 404);
    }
  }
}
