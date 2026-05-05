import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createRecipeDoc,
  initiator,
  populateRecipeDoc,
  queryParams,
} from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";

describe("favoriteService", () => {
  const mockFavoriteRepository = {
    create: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
    findByUser: vi.fn(),
  };
  const mockRecipeRepository = {
    exists: vi.fn(),
    modelName: "Recipe",
  };
  const mockUserRepository = {
    exists: vi.fn(),
    modelName: "User",
  };

  const service = createFavoriteService(
    mockFavoriteRepository,
    mockRecipeRepository,
    mockUserRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("add", () => {
    it("should add a favorite and return favorited: true", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.add(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: true });
      expect(mockFavoriteRepository.create).toHaveBeenCalledWith({
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
      mockUserRepository.exists.mockResolvedValue(true);

      await expect(
        service.add("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.exists.mockResolvedValue(true);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("should remove a favorite and return favorited: false", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.remove(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: false });
      expect(mockFavoriteRepository.delete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
    });
  });

  describe("isFavorited", () => {
    it("should return true when favorite exists", async () => {
      mockFavoriteRepository.exists.mockResolvedValue(true);

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(true);
    });

    it("should return false when favorite does not exist", async () => {
      mockFavoriteRepository.exists.mockResolvedValue(false);

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(false);
    });
  });

  describe("findByUser", () => {
    it("should return paginated recipes from favorites", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      const recipe = populateRecipeDoc(createRecipeDoc(), {
        isFavorited: true,
      });
      mockFavoriteRepository.findByUser.mockResolvedValue([[recipe], 1]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should return empty paginated result when no favorites", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockFavoriteRepository.findByUser.mockResolvedValue([[], 0]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
