import type { Minutes, RecipeQuery } from "@recipes/shared";
import type { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createRecipeDoc,
  initiator,
  noInitiator,
  populateRecipeDoc,
} from "@/__tests__/helpers.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";

function createMockRecipe(authorId?: Types.ObjectId) {
  const author = authorId ?? createObjectId();
  const doc = createRecipeDoc({ author });
  return {
    ...doc,
    author: {
      _id: doc.author,
      equals: (id: string) => id === doc.author.toString(),
    },
    save: vi.fn().mockResolvedValue(undefined),
    deleteOne: vi.fn().mockResolvedValue(undefined),
  };
}

describe("recipeService", () => {
  const mockRecipeRepository = {
    findDocumentById: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    deleteDocument: vi.fn(),
    aggregateSearch: vi.fn(),
    aggregateById: vi.fn(),
  };
  const mockUserRepository = {
    exists: vi.fn(),
    modelName: "User",
  };
  const mockFavoriteRepository = {
    exists: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    isFavorited: vi.fn(),
  };
  const mockCategoryRepository = {
    exists: vi.fn(),
    modelName: "Category",
  };
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    deletePattern: vi.fn(),
  };
  const mockBus = {
    emit: vi.fn(),
  };

  const service = createRecipeService(
    mockRecipeRepository,
    mockUserRepository,
    mockFavoriteRepository,
    mockCategoryRepository,
    mockCache,
    mockBus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated recipes", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe("Test Recipe");
      expect(result.pagination.total).toBe(1);
      expect(mockCache.get).toHaveBeenCalledWith(recipeCache.keys.list(query));
    });

    it("should return empty when aggregate returns empty result", async () => {
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[], 0]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should return empty when isFavorited filter is set but no initiator", async () => {
      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
        isFavorited: true,
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items).toEqual([]);
      expect(mockRecipeRepository.aggregateSearch).not.toHaveBeenCalled();
      expect(mockCache.get).not.toHaveBeenCalled();
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 4,
        averageRating: 4.2,
        ratingCount: 15,
      });
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items[0]?.userRating).toBe(4);
      expect(result.items[0]?.averageRating).toBe(4.2);
      expect(result.items[0]?.ratingCount).toBe(15);
    });

    it("should return null ratings when recipe has no ratings", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.items[0]?.userRating).toBeNull();
      expect(result.items[0]?.averageRating).toBeNull();
      expect(result.items[0]?.ratingCount).toBe(0);
    });
  });

  describe("findById", () => {
    it("should return recipe by ID", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(result.title).toBe("Test Recipe");
      expect(mockCache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should return cached recipe on second call for unauthenticated user", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      await service.findById(id, { initiator: noInitiator() });
      expect(mockCache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));

      vi.clearAllMocks();
      mockCache.get.mockResolvedValue(populated);

      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(mockRecipeRepository.aggregateById).not.toHaveBeenCalled();
      expect(result.title).toBe("Test Recipe");
      expect(mockCache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.findById("invalid-id", {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.aggregateById.mockResolvedValue(undefined);
      mockCache.get.mockResolvedValue(undefined);

      const id = createObjectId().toString();
      await expect(
        service.findById(id, {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(NotFoundError);
      expect(mockCache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 5,
        averageRating: 3.8,
        ratingCount: 42,
      });
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(result.userRating).toBe(5);
      expect(result.averageRating).toBe(3.8);
      expect(result.ratingCount).toBe(42);
    });
  });

  describe("create", () => {
    const createData = {
      title: "New Recipe",
      description: "A new recipe",
      ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
      instructions: ["Mix"],
      difficulty: "easy" as const,
      cookingTime: 20 as Minutes,
      servings: 2,
      isPublic: true,
    };

    it("should create and return a recipe", async () => {
      mockCategoryRepository.exists.mockResolvedValue(true);
      mockUserRepository.exists.mockResolvedValue(true);

      const authorId = createObjectId();
      const categoryId = createObjectId();
      const populated = populateRecipeDoc(
        createRecipeDoc({ title: "New Recipe" }),
        {
          author: { _id: authorId, name: "Chef", email: "chef@test.com" },
          category: { _id: categoryId, name: "Italian", slug: "italian" },
        },
      );

      mockRecipeRepository.create.mockResolvedValue(populated);

      const result = await service.create({
        data: { ...createData, category: categoryId.toString() },
        initiator: initiator(authorId.toString()),
      });

      expect(mockRecipeRepository.create).toHaveBeenCalledWith({
        ...createData,
        category: categoryId.toString(),
        author: authorId.toString(),
      });
      expect(result.title).toBe("New Recipe");
      expect(result.userRating).toBeNull();
      expect(result.averageRating).toBeNull();
      expect(result.ratingCount).toBe(0);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should throw BadRequestError for invalid author ID", async () => {
      await expect(
        service.create({
          data: { ...createData, category: createObjectId().toString() },
          initiator: { id: "invalid", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid category ID", async () => {
      await expect(
        service.create({
          data: { ...createData, category: "invalid" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when category not found", async () => {
      mockCategoryRepository.exists.mockResolvedValue(null);

      await expect(
        service.create({
          data: { ...createData, category: createObjectId().toString() },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when author not found", async () => {
      mockCategoryRepository.exists.mockResolvedValue(true);
      mockUserRepository.exists.mockResolvedValue(null);

      await expect(
        service.create({
          data: { ...createData, category: createObjectId().toString() },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("update", () => {
    it("should update recipe when author matches", async () => {
      const authorId = createObjectId();
      const recipe = createMockRecipe(authorId);
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);
      mockFavoriteRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.save.mockResolvedValue(
        populateRecipeDoc(createRecipeDoc({ author: authorId }), {
          title: "Updated",
        }),
      );

      const id = createObjectId().toString();
      const result = await service.update(id, {
        data: { title: "Updated" },
        initiator: initiator(authorId.toString()),
      });

      expect(mockRecipeRepository.findDocumentById).toHaveBeenCalledWith(id, {
        populate: false,
      });
      expect(mockRecipeRepository.save).toHaveBeenCalledWith(recipe, {
        title: "Updated",
      });
      expect(result.title).toBe("Updated");
      expect(result.userRating).toBeNull();
      expect(result.averageRating).toBeNull();
      expect(result.ratingCount).toBe(0);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should update recipe when user is admin", async () => {
      const authorId = createObjectId();
      const recipe = createMockRecipe(authorId);
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);
      mockFavoriteRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.save.mockResolvedValue(
        populateRecipeDoc(createRecipeDoc({ author: authorId }), {
          title: "Updated",
        }),
      );

      const id = createObjectId().toString();
      await expect(
        service.update(id, {
          data: { title: "Updated" },
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeDefined();
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.update("invalid-id", {
          data: {},
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.update(createObjectId().toString(), {
          data: {},
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const recipe = createMockRecipe();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      await expect(
        service.update(recipe._id.toString(), {
          data: {},
          initiator: initiator(createObjectId().toString()),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("delete", () => {
    it("should delete recipe when author matches", async () => {
      const authorId = createObjectId();
      const recipe = createMockRecipe(authorId);
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(authorId.toString()),
        }),
      ).resolves.toBeUndefined();
      expect(mockRecipeRepository.deleteDocument).toHaveBeenCalledWith(recipe);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should delete recipe when user is admin", async () => {
      const recipe = createMockRecipe();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeUndefined();
      expect(mockRecipeRepository.deleteDocument).toHaveBeenCalledWith(recipe);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const recipe = createMockRecipe();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(createObjectId().toString(), "user"),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
