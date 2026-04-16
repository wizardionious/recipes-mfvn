import type { SearchCategoryQuery } from "@recipes/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategoryDoc,
  createMockCache,
  createMockCategoryModel,
  createMockRecipeModel,
  createObjectId,
  initiator,
  noInitiator,
} from "@/__tests__/helpers.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import type { CategoryModelType } from "@/modules/categories/category.model.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";

describe("categoryService", () => {
  const categoryModel = createMockCategoryModel();
  const recipeModel = createMockRecipeModel();
  const cache = createMockCache();
  const service = createCategoryService(
    categoryModel as unknown as CategoryModelType,
    recipeModel as unknown as RecipeModelType,
    cache,
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    await cache.flush();
  });

  describe("findAll", () => {
    it("should return all categories sorted by name with recipe count", async () => {
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
      categoryModel.searchFull.mockResolvedValue(docs);

      const query = { sort: "name" } satisfies SearchCategoryQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(categoryModel.searchFull).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Desserts");
      expect(result[0]?.recipeCount).toBe(5);
      expect(result[1]?.recipeCount).toBe(0);
      expect(cache.get).toHaveBeenCalledWith(categoryCache.keys.list(query));
    });

    it("should return empty array when no categories exist", async () => {
      categoryModel.searchFull.mockResolvedValue([]);

      const query = { sort: "name" } satisfies SearchCategoryQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result).toEqual([]);
    });

    it("should return cached result on second call", async () => {
      const docs = [
        {
          ...createCategoryDoc({ name: "Desserts", slug: "desserts" }),
          recipeCount: 3,
        },
      ];
      categoryModel.searchFull.mockResolvedValue(docs);

      const query = { sort: "name" } satisfies SearchCategoryQuery;
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

      expect(categoryModel.searchFull).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(cache.get).toHaveBeenCalledWith(categoryCache.keys.list(query));
    });
  });

  describe("create", () => {
    it("should create and return a category", async () => {
      const doc = createCategoryDoc({
        name: "New Category",
        slug: "new-category",
      });
      categoryModel.create.mockResolvedValue({ toObject: () => doc });

      const result = await service.create({
        data: { name: "New Category" },
        initiator: initiator(),
      });

      expect(categoryModel.create).toHaveBeenCalledWith({
        name: "New Category",
      });
      expect(result.name).toBe("New Category");
      expect(result.slug).toBe("new-category");
      expect(cache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
    });
  });

  describe("deleteById", () => {
    it("should delete category when no recipes exist", async () => {
      recipeModel.countDocuments.mockResolvedValue(0);
      categoryModel.findByIdAndDelete.mockResolvedValue(createCategoryDoc());

      const id = createObjectId().toString();
      await service.deleteById(id, { initiator: initiator() });

      expect(recipeModel.countDocuments).toHaveBeenCalledWith({ category: id });
      expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(cache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
    });

    it("should throw ConflictError when recipes exist", async () => {
      recipeModel.countDocuments.mockResolvedValue(3);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when category not found", async () => {
      recipeModel.countDocuments.mockResolvedValue(0);
      categoryModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
