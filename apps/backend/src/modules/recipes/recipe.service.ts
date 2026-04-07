import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import type {
  CreateMethodParams,
  DefaultInitiator,
  QueryMethodParams,
  UpdateMethodParams,
} from "@/common/types/methods.js";
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
    params: QueryMethodParams<SearchRecipeQuery>,
  ): Promise<Paginated<Recipe>>;
  findById(id: string, params: Partial<DefaultInitiator>): Promise<Recipe>;
  create(params: CreateMethodParams<CreateRecipeBody>): Promise<Recipe>;
  update(
    id: string,
    params: UpdateMethodParams<UpdateRecipeBody>,
  ): Promise<Recipe>;
  delete(id: string, params: DefaultInitiator): Promise<void>;
}

export function createRecipeService(
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  favoriteModel: FavoriteModelType,
  categoryModel: CategoryModelType,
): RecipeService {
  return {
    findAll: async ({ query, initiator }) => {
      const { page, limit, isFavorited } = query;

      if (isFavorited && !initiator) {
        return withPagination([], 0, page, limit);
      }

      const [recipes, total] = await recipeModel.searchFull(query, initiator);
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

    findById: async (id, { initiator }) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }

      const recipe = await recipeModel.findByIdFull(id, initiator);
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      return toRecipe(recipe, recipe.isFavorited);
    },

    create: async ({ data, initiator }) => {
      if (!isValidObjectId(initiator)) {
        throw new BadRequestError("Invalid author ID");
      }
      if (!isValidObjectId(data.category)) {
        throw new BadRequestError("Invalid category ID");
      }

      const categoryExists = await categoryModel.exists({ _id: data.category });
      if (!categoryExists) {
        throw new NotFoundError("Category not found");
      }

      const authorExists = await userModel.exists({ _id: initiator });
      if (!authorExists) {
        throw new NotFoundError("Author not found");
      }

      const recipe = await recipeModel.create({ ...data, author: initiator });
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);
      return toRecipe(populated.toObject<typeof populated>(), false);
    },

    update: async (id, { data, initiator }) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipe = await recipeModel.findById(id);
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator)) {
        throw new ForbiddenError("Not authorized to update this recipe");
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
      if (initiator) {
        const favorite = await favoriteModel
          .findOne({
            user: initiator,
            recipe: id,
          })
          .lean();
        isFavorited = !!favorite;
      }

      return toRecipe(populated.toObject<typeof populated>(), isFavorited);
    },

    delete: async (id, { initiator }) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipe = await recipeModel.findById(id).select("+author");
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator)) {
        throw new ForbiddenError("Not authorized to delete this recipe");
      }

      await recipe.deleteOne();
    },
  };
}
