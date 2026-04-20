import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockFavoriteModel,
  createMockRecipeModel,
  createMockUserModel,
  createObjectId,
  createRecipeDoc,
  initiator,
  populateRecipeDoc,
  queryParams,
} from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";

describe("favoriteService", () => {
  const favoriteModel = createMockFavoriteModel();
  const recipeModel = createMockRecipeModel();
  const userModel = createMockUserModel();

  const service = createFavoriteService(
    favoriteModel as unknown as FavoriteModelType,
    recipeModel as unknown as RecipeModelType,
    userModel as unknown as UserModelType,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("add", () => {
    it("should add a favorite and return favorited: true", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.add(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: true });
      expect(favoriteModel.create).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.add(createObjectId().toString(), {
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      userModel.exists.mockResolvedValue(true);

      await expect(
        service.add("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      userModel.exists.mockResolvedValue(false);
      recipeModel.exists.mockResolvedValue(true);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(false);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("should remove a favorite and return favorited: false", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.remove(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: false });
      expect(favoriteModel.findOneAndDelete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
    });
  });

  describe("isFavorited", () => {
    it("should return true when favorite exists", async () => {
      favoriteModel.exists.mockResolvedValue({ _id: "some-id" });

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(true);
    });

    it("should return false when favorite does not exist", async () => {
      favoriteModel.exists.mockResolvedValue(null);

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(false);
    });
  });

  describe("findByUser", () => {
    it("should return paginated recipes from favorites", async () => {
      userModel.exists.mockResolvedValue(true);
      const recipe = populateRecipeDoc(createRecipeDoc(), {
        isFavorited: true,
      });
      favoriteModel.aggregate.mockResolvedValue([
        { items: [{ recipe }], total: 1 },
      ]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should return empty paginated result when no favorites", async () => {
      userModel.exists.mockResolvedValue(true);
      favoriteModel.aggregate.mockResolvedValue([]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
