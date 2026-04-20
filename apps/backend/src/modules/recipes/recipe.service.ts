import type {
  CreateRecipeBody,
  Paginated,
  Recipe,
  RecipeQuery,
  UpdateRecipeBody,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { CacheService } from "@/common/cache/cache.service.js";
import { ForbiddenError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  InitiatedMethodParams,
  OptionalInitiator,
  QueryMethodParams,
  UpdateMethodParams,
} from "@/common/types/methods.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { extractTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type {
  CategoryDocument,
  CategoryModelType,
} from "@/modules/categories/category.model.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import type {
  RecipeDocumentPopulated,
  RecipeModelType,
} from "@/modules/recipes/recipe.model.js";
import {
  buildFindByIdPipeline,
  buildSearchPipeline,
} from "@/modules/recipes/recipe.pipeline.js";
import type {
  UserDocument,
  UserModelType,
} from "@/modules/users/user.model.js";

export interface RecipeService {
  findAll(params: QueryMethodParams<RecipeQuery>): Promise<Paginated<Recipe>>;
  findById(
    id: string,
    params: InitiatedMethodParams<OptionalInitiator>,
  ): Promise<Recipe>;
  create(params: CreateMethodParams<CreateRecipeBody>): Promise<Recipe>;
  update(
    id: string,
    params: UpdateMethodParams<UpdateRecipeBody>,
  ): Promise<Recipe>;
  delete(id: string, params: DeleteMethodParams): Promise<void>;
}

export function createRecipeService(
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  favoriteModel: FavoriteModelType,
  categoryModel: CategoryModelType,
  cache: CacheService,
): RecipeService {
  return {
    findAll: async ({ query, initiator }) => {
      const { page, limit, isFavorited } = query;

      if (isFavorited && !initiator.id) {
        return withPagination([], 0, page, limit);
      }

      const isAuthenticated = !!initiator.id;

      if (!isAuthenticated) {
        const cacheKey = recipeCache.keys.list(query);

        const cached = await cache.get<Paginated<Recipe>>(cacheKey);
        if (cached !== undefined) {
          return cached;
        }
      }

      const [recipes, total] = extractTotalCountResult(
        await recipeModel.aggregate<
          WithTotalCountResult<RecipeDocumentPopulated>
        >(buildSearchPipeline({ query, initiator })),
      );

      const result = withPagination(
        recipes.map((recipe) => toRecipe(recipe, recipe.isFavorited)),
        total,
        page,
        limit,
      );

      if (!isAuthenticated) {
        const cacheKey = recipeCache.keys.list(query);
        await cache.set(cacheKey, result, recipeCache.ttl.list);
      }

      return result;
    },

    findById: async (id, params) => {
      assertValidId(id, "Recipe");

      const isAuthenticated = !!params.initiator.id;

      if (!isAuthenticated) {
        const cacheKey = recipeCache.keys.byId(id);
        const cached = await cache.get<Recipe>(cacheKey);
        if (cached !== undefined) {
          return cached;
        }
      }

      const recipes = await recipeModel.aggregate<RecipeDocumentPopulated>(
        buildFindByIdPipeline(id, params),
      );
      const recipe = recipes[0];
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      const result = toRecipe(recipe, recipe.isFavorited);

      if (!isAuthenticated) {
        const cacheKey = recipeCache.keys.byId(id);
        await cache.set(cacheKey, result, recipeCache.ttl.byId);
      }

      return result;
    },

    create: async ({ data, initiator }) => {
      assertValidId(initiator.id, "Author");
      assertValidId(data.category, "Category");

      await assertExists(categoryModel, data.category);
      await assertExists(userModel, initiator.id);

      const recipe = await recipeModel.create({
        ...data,
        author: initiator.id,
      });
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);

      await cache.deletePattern(recipeCache.keys.allPattern());

      return toRecipe(populated.toObject<typeof populated>(), false);
    },

    update: async (id, { data, initiator }) => {
      assertValidId(id, "Recipe");
      const recipe = await recipeModel.findById(id);
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator.id) && initiator.role !== "admin") {
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

      const isFavorited = !!(await favoriteModel
        .findOne({
          user: initiator.id,
          recipe: id,
        })
        .lean());

      await Promise.all([
        cache.delete(recipeCache.keys.byId(id)),
        cache.deletePattern(recipeCache.keys.allPattern()),
      ]);

      return toRecipe(populated.toObject<typeof populated>(), isFavorited);
    },

    delete: async (id, { initiator }) => {
      assertValidId(id, "Recipe");
      const recipe = await recipeModel.findById(id).select("+author");
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to delete this recipe");
      }

      await recipe.deleteOne();

      await Promise.all([
        cache.delete(recipeCache.keys.byId(id)),
        cache.deletePattern(recipeCache.keys.allPattern()),
      ]);
    },
  };
}
