import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { Model } from "mongoose";
import mongoose from "mongoose";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type { CategoryDocument } from "@/modules/categories/index.js";
import type { FavoriteDocument } from "@/modules/favorites/index.js";
import type {
  CreateRecipeBody,
  RecipeDocument,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/index.js";
import {
  buildRecipeFilter,
  withVisibilityFilter,
} from "@/modules/recipes/index.js";
import type { UserDocument } from "@/modules/users/index.js";

export interface RecipeService {
  findAll(
    query: SearchRecipeQuery,
    userId?: string,
  ): Promise<Paginated<Recipe>>;
  findById(id: string, userId?: string): Promise<Recipe>;
  create(data: CreateRecipeBody, authorId: string): Promise<Recipe>;
  update(id: string, data: UpdateRecipeBody, userId: string): Promise<Recipe>;
  delete(id: string, userId: string): Promise<void>;
}

export function createRecipeService(
  recipeModel: Model<RecipeDocument>,
  userModel: Model<UserDocument>,
  favoriteModel: Model<FavoriteDocument>,
  categoryModel: Model<CategoryDocument>,
): RecipeService {
  return {
    findAll: async (query, userId) => {
      const { page, limit, sort, isFavorited } = query;
      const filter = withVisibilityFilter(buildRecipeFilter(query), userId);

      // Filter by favorites
      if (isFavorited === true) {
        if (!userId) {
          // Can't filter favorites without auth
          return withPagination([], 0, page, limit);
        }

        const favorites = await favoriteModel.find({ user: userId }).lean();
        const favoritedRecipeIds = favorites.map((f) => f.recipe);

        if (favoritedRecipeIds.length === 0) {
          return withPagination([], 0, page, limit);
        }

        filter._id = { $in: favoritedRecipeIds };
      }

      const [items, total] = await Promise.all([
        recipeModel
          .find(filter)
          .populate<{
            author: Pick<UserDocument, "_id" | "name" | "email">;
          }>("author", "name email")
          .populate<{
            category: Pick<CategoryDocument, "_id" | "name" | "slug">;
          }>("category", "name slug")
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        recipeModel.countDocuments(filter),
      ]);

      // Get favorited recipe IDs for current user
      const favoritedIds =
        userId && items.length > 0
          ? new Set(
              (
                await favoriteModel
                  .find({
                    user: userId,
                    recipe: { $in: items.map((item) => String(item._id)) },
                  })
                  .lean()
              ).map((f) => String(f.recipe)),
            )
          : new Set<string>();

      return withPagination(
        items.map((item) => toRecipe(item, favoritedIds.has(String(item._id)))),
        total,
        page,
        limit,
      );
    },

    findById: async (id, userId) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid recipe ID", 400);
      }

      const recipe = await recipeModel
        .findById(id)
        .populate<{
          author: Pick<UserDocument, "_id" | "name" | "email">;
        }>("author", "name email")
        .populate<{
          category: Pick<CategoryDocument, "_id" | "name" | "slug">;
        }>("category", "name slug")
        .lean();
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      // Check access to private recipes
      if (!recipe.isPublic && !recipe.author._id.equals(userId)) {
        throw new AppError("Recipe not found", 404);
      }

      let isFavorited = false;
      if (userId) {
        const favorite = await favoriteModel
          .findOne({
            user: userId,
            recipe: id,
          })
          .lean();
        isFavorited = !!favorite;
      }

      return toRecipe(recipe, isFavorited);
    },

    create: async (data, authorId) => {
      if (!mongoose.isValidObjectId(authorId)) {
        throw new AppError("Invalid author ID", 400);
      }
      if (!mongoose.isValidObjectId(data.category)) {
        throw new AppError("Invalid category ID", 400);
      }

      const categoryExists = await categoryModel.exists({ _id: data.category });
      if (!categoryExists) {
        throw new AppError("Category not found", 400);
      }

      const authorExists = await userModel.exists({ _id: authorId });
      if (!authorExists) {
        throw new AppError("Author not found", 400);
      }

      const recipe = await recipeModel.create({ ...data, author: authorId });
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);
      return toRecipe(populated.toObject<typeof populated>(), false);
    },

    update: async (id, data, userId) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid recipe ID", 400);
      }
      const recipe = await recipeModel.findById(id);
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      if (!recipe.author.equals(userId)) {
        throw new AppError("Not authorized to update this recipe", 403);
      }

      Object.assign(recipe, data);
      await recipe.save();
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);

      let isFavorited = false;
      if (userId) {
        const favorite = await favoriteModel
          .findOne({
            user: userId,
            recipe: id,
          })
          .lean();
        isFavorited = !!favorite;
      }

      return toRecipe(populated.toObject<typeof populated>(), isFavorited);
    },

    delete: async (id, userId) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid recipe ID", 400);
      }
      const recipe = await recipeModel.findById(id);
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      if (!recipe.author.equals(userId)) {
        throw new AppError("Not authorized to delete this recipe", 403);
      }

      await recipe.deleteOne();
    },
  };
}
