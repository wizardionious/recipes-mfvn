import { beforeEach, describe, expect, it, vi } from "vitest";
import { createObjectId, initiator } from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import { createRecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";

describe("recipeRatingService", () => {
  const mockRecipeRatingRepository = {
    upsert: vi.fn(),
    delete: vi.fn(),
  };
  const mockRecipeRepository = {
    exists: vi.fn(),
    modelName: "Recipe",
  };
  const mockUserRepository = {
    exists: vi.fn(),
    modelName: "User",
  };
  const mockBus = {
    emit: vi.fn(),
  };

  const service = createRecipeRatingService(
    mockRecipeRatingRepository,
    mockRecipeRepository,
    mockUserRepository,
    mockBus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rate", () => {
    it("should create a new rating", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);
      mockRecipeRatingRepository.upsert.mockResolvedValue({
        document: {
          _id: createObjectId(),
          user: createObjectId(),
          recipe: createObjectId(),
          value: 4,
          createdAt: new Date(),
        },
        oldDoc: null,
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 4 },
        initiator: init,
      });

      expect(result).toEqual({ value: 4 });
      expect(mockRecipeRatingRepository.upsert).toHaveBeenCalledWith(
        { user: init.id, recipe: recipeId },
        4,
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe-rating:created", {
        recipeId: recipeId,
        userId: init.id,
        value: 4,
      });
    });

    it("should update an existing rating", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);
      const baseDoc = {
        _id: createObjectId(),
        user: createObjectId(),
        recipe: createObjectId(),
        value: 5,
        createdAt: new Date(),
      };
      mockRecipeRatingRepository.upsert.mockResolvedValue({
        document: baseDoc,
        oldDoc: {
          ...baseDoc,
          value: 3,
        },
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 5 },
        initiator: init,
      });

      expect(result).toEqual({ value: 5 });
      expect(mockBus.emit).toHaveBeenCalledWith("recipe-rating:updated", {
        recipeId,
        userId: init.id,
        previousValue: 3,
        value: 5,
      });
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      mockUserRepository.exists.mockResolvedValue(true);

      await expect(
        service.rate("invalid-id", {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.exists.mockResolvedValue(true);

      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("should remove an existing rating", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);
      mockRecipeRatingRepository.delete.mockResolvedValue({
        _id: createObjectId(),
        user: createObjectId(),
        recipe: createObjectId(),
        value: 4,
        createdAt: new Date(),
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      await service.remove(recipeId, { initiator: init });

      expect(mockRecipeRatingRepository.delete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
      expect(mockBus.emit).toHaveBeenCalledWith("recipe-rating:deleted", {
        recipeId,
        userId: init.id,
        value: 4,
      });
    });

    it("should throw NotFoundError when rating does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(true);
      mockRecipeRatingRepository.delete.mockResolvedValue(null);

      await expect(
        service.remove(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.remove(createObjectId().toString(), {
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockRecipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.remove(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
