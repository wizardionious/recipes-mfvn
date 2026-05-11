import type {
  Category,
  CategoryQuery,
  CategoryWithComputed,
  CreateCategoryBody,
  Paginated,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { CacheService } from "@/common/cache/cache.service.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import type { CategoryRepository } from "@/modules/categories/category.repository.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import { toCategory } from "./category.mapper.js";

export interface CategoryService {
  findAll(
    params: QueryMethodParams<CategoryQuery>,
  ): Promise<Paginated<CategoryWithComputed>>;
  create(params: CreateMethodParams<CreateCategoryBody>): Promise<Category>;
  deleteById(id: string, params: DeleteMethodParams): Promise<void>;
}

type CategoryRepositoryPort = Pick<
  CategoryRepository,
  "findMany" | "create" | "delete"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "count">;
type CacheServicePort = Pick<CacheService, "get" | "set" | "deletePattern">;
type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createCategoryService(
  repository: CategoryRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  cache: CacheServicePort,
  bus: TypedEmitterPort,
): CategoryService {
  return {
    findAll: async ({ query }) => {
      const cacheKey = categoryCache.keys.list(query);

      const cached = await cache.get<Paginated<CategoryWithComputed>>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      const [categories, total] = await repository.findMany(query);
      const result = withPagination(
        categories.map(toCategory),
        total,
        query.page,
        query.limit,
      );

      await cache.set(cacheKey, result, categoryCache.ttl.list);

      return result;
    },

    create: async ({ data }) => {
      const category = await repository.create(data);

      await cache.deletePattern(categoryCache.keys.allPattern());
      bus.emit("category:changed");

      return toCategory(category);
    },

    deleteById: async (id) => {
      const recipeCount = await recipeRepository.count({
        category: id,
      });
      if (recipeCount > 0) {
        throw new ConflictError("Cannot delete category with existing recipes");
      }

      const result = await repository.delete(id);
      if (!result) {
        throw new NotFoundError("Category not found");
      }

      await cache.deletePattern(categoryCache.keys.allPattern());
      bus.emit("category:changed");
    },
  };
}
