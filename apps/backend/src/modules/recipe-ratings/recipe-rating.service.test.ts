import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockBus,
  createMockRatingModel,
  createMockRecipeModel,
  createMockUserModel,
  createObjectId,
  initiator,
} from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";
import type { RecipeRatingModelType } from "./recipe-rating.model.js";
import { createRecipeRatingService } from "./recipe-rating.service.js";

describe("recipeRatingService", () => {
  const ratingModel = createMockRatingModel();
  const recipeModel = createMockRecipeModel();
  const userModel = createMockUserModel();
  const bus = createMockBus();

  const service = createRecipeRatingService(
    ratingModel as unknown as RecipeRatingModelType,
    recipeModel as unknown as RecipeModelType,
    userModel as unknown as UserModelType,
    bus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rate", () => {
    it("should create a new rating", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);
      ratingModel.findOneAndUpdate.mockResolvedValue({
        value: 4,
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 4 },
        initiator: init,
      });

      expect(result).toEqual({ value: 4 });
      expect(ratingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: init.id, recipe: recipeId },
        { value: 4 },
        { upsert: true, returnDocument: "after" },
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:rated", recipeId);
    });

    it("should update an existing rating", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);
      ratingModel.findOneAndUpdate.mockResolvedValue({
        value: 5,
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 5 },
        initiator: init,
      });

      expect(result).toEqual({ value: 5 });
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
      userModel.exists.mockResolvedValue(true);

      await expect(
        service.rate("invalid-id", {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      userModel.exists.mockResolvedValue(false);
      recipeModel.exists.mockResolvedValue(true);

      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(false);

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
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);
      ratingModel.findOneAndDelete.mockResolvedValue({
        _id: createObjectId(),
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      await service.remove(recipeId, { initiator: init });

      expect(ratingModel.findOneAndDelete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
      expect(bus.emit).toHaveBeenCalledWith("recipe:rated", recipeId);
    });

    it("should throw NotFoundError when rating does not exist", async () => {
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(true);
      ratingModel.findOneAndDelete.mockResolvedValue(null);

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
      userModel.exists.mockResolvedValue(true);
      recipeModel.exists.mockResolvedValue(false);

      await expect(
        service.remove(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
