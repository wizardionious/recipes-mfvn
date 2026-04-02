import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import type {
  CreateRecipeBody,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/recipe.schema.js";
import { UserModel } from "@/modules/users/user.model.js";
import {
  buildRecipeFilter,
  withVisibilityFilter,
} from "./recipe-filter.builder.js";

export class RecipeService {
  async findAll(
    query: SearchRecipeQuery,
    userId?: string,
  ): Promise<Paginated<Recipe>> {
    const { page, limit, sort, isFavorited } = query;
    const filter = withVisibilityFilter(buildRecipeFilter(query), userId);

    // Filter by favorites
    if (isFavorited === true) {
      if (!userId) {
        // Can't filter favorites without auth
        return withPagination([], 0, page, limit);
      }

      const favorites = await FavoriteModel.find({ user: userId }).lean();
      const favoritedRecipeIds = favorites.map((f) => f.recipe);

      if (favoritedRecipeIds.length === 0) {
        return withPagination([], 0, page, limit);
      }

      filter._id = { $in: favoritedRecipeIds };
    }

    const [items, total] = await Promise.all([
      RecipeModel.find(filter)
        .populate("author", "name email")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RecipeModel.countDocuments(filter),
    ]);

    // Get favorited recipe IDs for current user
    let favoritedIds = new Set<string>();
    if (userId && items.length > 0) {
      const recipeIds = items.map((item) => String(item._id));
      const favorites = await FavoriteModel.find({
        user: userId,
        recipe: { $in: recipeIds },
      }).lean();
      favoritedIds = new Set(favorites.map((f) => String(f.recipe)));
    }

    return withPagination(
      items.map((item) => toRecipe(item, favoritedIds.has(String(item._id)))),
      total,
      page,
      limit,
    );
  }

  async findById(id: string, userId?: string): Promise<Recipe> {
    const recipe = await RecipeModel.findById(id)
      .populate("author", "name email")
      .populate("category", "name slug")
      .lean();
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    // Check access to private recipes
    if (!recipe.isPublic && recipe.author._id.toString() !== userId) {
      throw new AppError("Recipe not found", 404);
    }

    let isFavorited = false;
    if (userId) {
      const favorite = await FavoriteModel.findOne({
        user: userId,
        recipe: id,
      }).lean();
      isFavorited = !!favorite;
    }

    return toRecipe(recipe, isFavorited);
  }

  async create(data: CreateRecipeBody, authorId: string): Promise<Recipe> {
    const category = await CategoryModel.findById(data.category);
    if (!category) {
      throw new AppError("Category does not exist", 400);
    }

    const author = await UserModel.findById(authorId);
    if (!author) {
      throw new AppError("Author not found", 400);
    }

    const recipe = await RecipeModel.create({ ...data, author: authorId });
    const populated = await recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
    return toRecipe(populated.toObject(), false);
  }

  async update(
    id: string,
    data: UpdateRecipeBody,
    userId: string,
  ): Promise<Recipe> {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    if (recipe.author.toString() !== userId) {
      throw new AppError("Not authorized to update this recipe", 403);
    }

    Object.assign(recipe, data);
    await recipe.save();
    const populated = await recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);

    let isFavorited = false;
    if (userId) {
      const favorite = await FavoriteModel.findOne({
        user: userId,
        recipe: id,
      }).lean();
      isFavorited = !!favorite;
    }

    return toRecipe(populated.toObject(), isFavorited);
  }

  async delete(id: string, userId: string): Promise<void> {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    if (recipe.author.toString() !== userId) {
      throw new AppError("Not authorized to delete this recipe", 403);
    }

    await recipe.deleteOne();
  }
}
