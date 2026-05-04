import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategoryDoc,
  createMockBus,
  createMockCache,
  createMockCategoryRepository,
  createMockRecipeRepository,
  createObjectId,
  initiator,
  noInitiator,
} from "@/__tests__/helpers.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import type { CategoryRepository } from "@/modules/categories/category.repository.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";

describe("categoryService", () => {
  const categoryRepository = createMockCategoryRepository();
  const recipeRepository = createMockRecipeRepository();
  const cache = createMockCache();
  const bus = createMockBus();
  const service = createCategoryService(
    categoryRepository as unknown as CategoryRepository,
    recipeRepository as unknown as RecipeRepository,
    cache,
    bus,
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    await cache.flush();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated categories sorted by name with recipe count", async () => {
      const docs = [
        {
          ...createCategoryDoc({ name: "Desserts", slug: "desserts" }),
          recipeCount: 5,
        },
        {
          ...createCategoryDoc({ name: "Soups", slug: "soups" }),
          recipeCount: 0,
        },
      ];
      categoryRepository.findMany.mockResolvedValue([docs, 2]);

      const query = { sort: "name" as const, page: 1, limit: 10 };
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(categoryRepository.findMany).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.name).toBe("Desserts");
      expect(result.items[0]?.recipeCount).toBe(5);
      expect(result.items[1]?.recipeCount).toBe(0);
      expect(result.pagination.total).toBe(2);
      expect(cache.get).toHaveBeenCalledWith(categoryCache.keys.list(query));
    });

    it("should return empty paginated result when no categories exist", async () => {
      categoryRepository.findMany.mockResolvedValue([[], 0]);

      const query = { sort: "name" as const, page: 1, limit: 10 };
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should return cached result on second call", async () => {
      const docs = [
        {
          ...createCategoryDoc({ name: "Desserts", slug: "desserts" }),
          recipeCount: 3,
        },
      ];
      categoryRepository.findMany.mockResolvedValue([docs, 1]);

      const query = { sort: "name" as const, page: 1, limit: 10 };
      await service.findAll({
        query,
        initiator: noInitiator(),
      });
      expect(cache.get).toHaveBeenCalledWith(categoryCache.keys.list(query));
      vi.clearAllMocks();

      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(categoryRepository.findMany).not.toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(cache.get).toHaveBeenCalledWith(categoryCache.keys.list(query));
    });
  });

  describe("create", () => {
    it("should create and return a category", async () => {
      const doc = createCategoryDoc({
        name: "New Category",
        slug: "new-category",
      });
      categoryRepository.create.mockResolvedValue(doc);

      const result = await service.create({
        data: { name: "New Category" },
        initiator: initiator(),
      });

      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: "New Category",
      });
      expect(result.name).toBe("New Category");
      expect(result.slug).toBe("new-category");
      expect(cache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("category:changed");
    });
  });

  describe("deleteById", () => {
    it("should delete category when no recipes exist", async () => {
      recipeRepository.count.mockResolvedValue(0);
      categoryRepository.delete.mockResolvedValue(createCategoryDoc());

      const id = createObjectId().toString();
      await service.deleteById(id, { initiator: initiator() });

      expect(recipeRepository.count).toHaveBeenCalledWith({
        category: id,
      });
      expect(categoryRepository.delete).toHaveBeenCalledWith(id);
      expect(cache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("category:changed");
    });

    it("should throw ConflictError when recipes exist", async () => {
      recipeRepository.count.mockResolvedValue(3);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when category not found", async () => {
      recipeRepository.count.mockResolvedValue(0);
      categoryRepository.delete.mockResolvedValue(null);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
