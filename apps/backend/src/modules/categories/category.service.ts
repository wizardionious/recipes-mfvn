import type { Category, SearchCategoryQuery } from "@recipes/shared";
import type { CacheService } from "@/common/cache/cache.service.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toCategory } from "@/common/utils/mongo.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import type {
  CategoryModelType,
  CreateCategoryBody,
} from "@/modules/categories/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";

export interface CategoryService {
  findAll(params: QueryMethodParams<SearchCategoryQuery>): Promise<Category[]>;
  create(params: CreateMethodParams<CreateCategoryBody>): Promise<Category>;
  deleteById(categoryId: string, params: DeleteMethodParams): Promise<void>;
}

export function createCategoryService(
  categoryModel: CategoryModelType,
  recipeModel: RecipeModelType,
  cache: CacheService,
): CategoryService {
  return {
    findAll: async ({ query }) => {
      const cacheKey = categoryCache.keys.list(query);

      const cached = await cache.get<Category[]>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      const categories = await categoryModel.searchFull(query);
      const result = categories.map(toCategory);

      await cache.set(cacheKey, result, categoryCache.ttl.list);

      return result;
    },

    create: async ({ data }) => {
      const category = await categoryModel.create(data);

      await cache.deletePattern(categoryCache.keys.allPattern());

      return toCategory(category.toObject());
    },

    deleteById: async (categoryId) => {
      const recipeCount = await recipeModel.countDocuments({
        category: categoryId,
      });
      if (recipeCount > 0) {
        throw new ConflictError("Cannot delete category with existing recipes");
      }

      const result = await categoryModel.findByIdAndDelete(categoryId);
      if (!result) {
        throw new NotFoundError("Category not found");
      }

      await cache.deletePattern(categoryCache.keys.allPattern());
    },
  };
}
