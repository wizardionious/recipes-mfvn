import type { Minutes, RecipeQuery } from "@recipes/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockBus,
  createMockCache,
  createMockCategoryModel,
  createMockFavoriteModel,
  createMockRecipeModel,
  createMockUserModel,
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
import type { CategoryModelType } from "@/modules/categories/category.model.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";
import type { UserModelType } from "@/modules/users/user.model.js";

describe("recipeService", () => {
  const recipeModel = createMockRecipeModel();
  const userModel = createMockUserModel();
  const favoriteModel = createMockFavoriteModel();
  const categoryModel = createMockCategoryModel();
  const cache = createMockCache();
  const bus = createMockBus();
  const service = createRecipeService(
    recipeModel as unknown as RecipeModelType,
    userModel as unknown as UserModelType,
    favoriteModel as unknown as FavoriteModelType,
    categoryModel as unknown as CategoryModelType,
    cache,
    bus,
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    await cache.flush();
  });

  describe("findAll", () => {
    it("should return paginated recipes", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      recipeModel.aggregate.mockResolvedValue([
        { items: [populated], total: 1 },
      ]);

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
      expect(cache.get).toHaveBeenCalledWith(recipeCache.keys.list(query));
    });

    it("should return empty when aggregate returns empty result", async () => {
      recipeModel.aggregate.mockResolvedValue([]);

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
      expect(recipeModel.aggregate).not.toHaveBeenCalled();
      expect(cache.get).not.toHaveBeenCalled();
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 4,
        averageRating: 4.2,
        ratingCount: 15,
      });
      recipeModel.aggregate.mockResolvedValue([
        { items: [populated], total: 1 },
      ]);

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
      recipeModel.aggregate.mockResolvedValue([
        { items: [populated], total: 1 },
      ]);

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
      recipeModel.aggregate.mockResolvedValue([populated]);

      const id = createObjectId().toString();
      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(result.title).toBe("Test Recipe");
      expect(cache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should return cached recipe on second call for unauthenticated user", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      recipeModel.aggregate.mockResolvedValue([populated]);

      const id = createObjectId().toString();
      await service.findById(id, { initiator: noInitiator() });

      vi.clearAllMocks();

      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(recipeModel.aggregate).not.toHaveBeenCalled();
      expect(result.title).toBe("Test Recipe");
      expect(cache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.findById("invalid-id", {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      recipeModel.aggregate.mockResolvedValue([]);

      const id = createObjectId().toString();
      await expect(
        service.findById(id, {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(NotFoundError);
      expect(cache.get).toHaveBeenCalledWith(recipeCache.keys.byId(id));
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 5,
        averageRating: 3.8,
        ratingCount: 42,
      });
      recipeModel.aggregate.mockResolvedValue([populated]);

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
      categoryModel.exists.mockResolvedValue(true);
      userModel.exists.mockResolvedValue(true);

      const authorId = createObjectId();
      const categoryId = createObjectId();
      const doc = createRecipeDoc({ title: "New Recipe" });
      const populated = populateRecipeDoc(doc, {
        author: { _id: authorId, name: "Chef", email: "chef@test.com" },
        category: { _id: categoryId, name: "Italian", slug: "italian" },
      });

      recipeModel.create.mockResolvedValue({
        ...doc,
        populate: vi.fn().mockResolvedValue({
          toObject: () => populated,
        }),
      });

      const result = await service.create({
        data: { ...createData, category: categoryId.toString() },
        initiator: initiator(authorId.toString()),
      });

      expect(recipeModel.create).toHaveBeenCalled();
      expect(result.title).toBe("New Recipe");
      expect(result.userRating).toBeNull();
      expect(result.averageRating).toBeNull();
      expect(result.ratingCount).toBe(0);
      expect(cache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:changed");
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
      categoryModel.exists.mockResolvedValue(null);

      await expect(
        service.create({
          data: { ...createData, category: createObjectId().toString() },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when author not found", async () => {
      categoryModel.exists.mockResolvedValue(true);
      userModel.exists.mockResolvedValue(null);

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
      const doc = createRecipeDoc({ author: authorId });
      const recipe = {
        ...doc,
        save: vi.fn().mockResolvedValue(undefined),
        populate: vi.fn().mockResolvedValue({
          toObject: () => populateRecipeDoc(doc, { title: "Updated" }),
        }),
      };
      recipeModel.findById.mockResolvedValue(recipe);
      favoriteModel.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const id = createObjectId().toString();
      const result = await service.update(id, {
        data: { title: "Updated" },
        initiator: initiator(authorId.toString()),
      });

      expect(recipe.save).toHaveBeenCalled();
      expect(result.title).toBe("Updated");
      expect(result.userRating).toBeNull();
      expect(result.averageRating).toBeNull();
      expect(result.ratingCount).toBe(0);
      expect(cache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(cache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should update recipe when user is admin", async () => {
      const authorId = createObjectId();
      const doc = createRecipeDoc({ author: authorId });
      const recipe = {
        ...doc,
        save: vi.fn().mockResolvedValue(undefined),
        populate: vi.fn().mockResolvedValue({
          toObject: () => populateRecipeDoc(doc, { title: "Updated" }),
        }),
      };
      recipeModel.findById.mockResolvedValue(recipe);
      favoriteModel.findOne.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const id = createObjectId().toString();
      await expect(
        service.update(id, {
          data: { title: "Updated" },
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeDefined();
      expect(cache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(cache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:changed");
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
      recipeModel.findById.mockResolvedValue(null);

      await expect(
        service.update(createObjectId().toString(), {
          data: {},
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const recipe = createRecipeDoc();
      recipeModel.findById.mockResolvedValue(recipe);

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
      recipeModel.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          author: { equals: (id: string) => id === authorId.toString() },
          deleteOne: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(authorId.toString()),
        }),
      ).resolves.toBeUndefined();
      expect(cache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(cache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should delete recipe when user is admin", async () => {
      recipeModel.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          author: { equals: () => false },
          deleteOne: vi.fn().mockResolvedValue(undefined),
        }),
      });

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeUndefined();
      expect(cache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(cache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:changed");
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      recipeModel.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      recipeModel.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          author: { equals: () => false },
          deleteOne: vi.fn(),
        }),
      });

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(createObjectId().toString(), "user"),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
