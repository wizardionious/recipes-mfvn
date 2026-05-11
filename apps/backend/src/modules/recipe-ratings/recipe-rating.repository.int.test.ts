import { describe, expect, it } from "vitest";
import { createDbRecipe, createDbUser } from "@/__tests__/db-factories.js";
import { RecipeRatingModel } from "./recipe-rating.model.js";
import { RecipeRatingRepository } from "./recipe-rating.repository.js";

describe("RecipeRatingRepository", () => {
  const repository = new RecipeRatingRepository(RecipeRatingModel);

  describe("upsert", () => {
    it("should create a new rating when none exists", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const result = await repository.upsert(
        { user: user._id, recipe: recipe._id },
        4,
      );

      expect(result.document.value).toBe(4);
      expect(result.document.user.toString()).toBe(user._id.toString());
      expect(result.document.recipe.toString()).toBe(recipe._id.toString());
      expect(result.oldDoc).toBeNull();
    });

    it("should update an existing rating and return oldDoc", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      await repository.upsert({ user: user._id, recipe: recipe._id }, 3);
      const updated = await repository.upsert(
        { user: user._id, recipe: recipe._id },
        5,
      );

      expect(updated.document.value).toBe(5);
      expect(updated.oldDoc).not.toBeNull();
      expect(updated.oldDoc?.value).toBe(3);
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a rating", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        user: user._id.toString(),
        recipe: recipe._id.toString(),
        value: 4,
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.value).toBe(4);
    });

    it("should delete a rating by id", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        user: user._id.toString(),
        recipe: recipe._id.toString(),
        value: 5,
      });

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
