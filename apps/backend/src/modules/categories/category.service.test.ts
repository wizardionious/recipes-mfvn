import { withPagination } from "@recipes/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategoryDoc,
  createObjectId,
  initiator,
  noInitiator,
} from "@/__tests__/helpers.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import { createCategoryService } from "@/modules/categories/category.service.js";

describe("categoryService", () => {
  const mockCategoryRepository = {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const mockRecipeRepository = {
    count: vi.fn(),
  };
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    deletePattern: vi.fn(),
  };
  const mockBus = {
    emit: vi.fn(),
  };
  const service = createCategoryService(
    mockCategoryRepository,
    mockRecipeRepository,
    mockCache,
    mockBus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
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
      mockCategoryRepository.findMany.mockResolvedValue([docs, 2]);

      const query = { sort: "name" as const, page: 1, limit: 10 };
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(mockCategoryRepository.findMany).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.name).toBe("Desserts");
      expect(result.items[0]?.recipeCount).toBe(5);
      expect(result.items[1]?.recipeCount).toBe(0);
      expect(result.pagination.total).toBe(2);
      expect(mockCache.get).toHaveBeenCalledWith(
        categoryCache.keys.list(query),
      );
    });

    it("should return empty paginated result when no categories exist", async () => {
      mockCategoryRepository.findMany.mockResolvedValue([[], 0]);

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
      mockCategoryRepository.findMany.mockResolvedValue([docs, 1]);

      const query = { sort: "name" as const, page: 1, limit: 10 };
      await service.findAll({
        query,
        initiator: noInitiator(),
      });
      expect(mockCache.get).toHaveBeenCalledWith(
        categoryCache.keys.list(query),
      );
      vi.clearAllMocks();
      mockCache.get.mockResolvedValue(withPagination(docs, 1, 1, 10));

      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(mockCategoryRepository.findMany).not.toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockCache.get).toHaveBeenCalledWith(
        categoryCache.keys.list(query),
      );
    });
  });

  describe("create", () => {
    it("should create and return a category", async () => {
      const doc = createCategoryDoc({
        name: "New Category",
        slug: "new-category",
      });
      mockCategoryRepository.create.mockResolvedValue(doc);

      const result = await service.create({
        data: {
          name: "New Category",
          image: { url: "https://example.com/cat.jpg" },
        },
        initiator: initiator(),
      });

      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: "New Category",
        image: { url: "https://example.com/cat.jpg" },
      });
      expect(result.name).toBe("New Category");
      expect(result.slug).toBe("new-category");
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("category:created", {
        categoryId: doc._id.toHexString(),
      });
    });
  });

  describe("deleteById", () => {
    it("should delete category when no recipes exist", async () => {
      mockRecipeRepository.count.mockResolvedValue(0);
      mockCategoryRepository.delete.mockResolvedValue(createCategoryDoc());

      const id = createObjectId().toString();
      await service.deleteById(id, { initiator: initiator() });

      expect(mockRecipeRepository.count).toHaveBeenCalledWith({
        category: id,
      });
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(id);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        categoryCache.keys.allPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("category:deleted", {
        categoryId: id,
      });
    });

    it("should throw ConflictError when recipes exist", async () => {
      mockRecipeRepository.count.mockResolvedValue(3);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when category not found", async () => {
      mockRecipeRepository.count.mockResolvedValue(0);
      mockCategoryRepository.delete.mockResolvedValue(null);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
