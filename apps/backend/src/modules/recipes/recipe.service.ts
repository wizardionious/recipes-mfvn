import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type {
  CategoryDocument,
  CategoryModelType,
} from "@/modules/categories/index.js";
import type { FavoriteModelType } from "@/modules/favorites/index.js";
import type {
  CreateRecipeBody,
  RecipeModelType,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/index.js";
import type { UserDocument, UserModelType } from "@/modules/users/index.js";

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
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  favoriteModel: FavoriteModelType,
  categoryModel: CategoryModelType,
): RecipeService {
  return {
    findAll: async (query, userId) => {
      const { page, limit, isFavorited } = query;

      if (isFavorited && !userId) {
        return withPagination([], 0, page, limit);
      }

      const [recipes, total] = await recipeModel.searchFull(query, userId);
      if (!recipes) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(
        recipes.map((recipe) => toRecipe(recipe, recipe.isFavorited)),
        total,
        page,
        limit,
      );
    },

    findById: async (id, userId) => {
      if (!isValidObjectId(id)) {
        throw new AppError("Invalid recipe ID", 400);
      }

      const recipe = await recipeModel.findByIdFull(id, userId);
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      return toRecipe(recipe, recipe.isFavorited);
    },

    create: async (data, authorId) => {
      if (!isValidObjectId(authorId)) {
        throw new AppError("Invalid author ID", 400);
      }
      if (!isValidObjectId(data.category)) {
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
      if (!isValidObjectId(id)) {
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
      if (!isValidObjectId(id)) {
        throw new AppError("Invalid recipe ID", 400);
      }
      const recipe = await recipeModel.findById(id).select("+author");
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
