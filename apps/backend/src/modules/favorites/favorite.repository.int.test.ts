import { describe, expect, it } from "vitest";
import {
  createDbCategory,
  createDbFavorite,
  createDbRecipe,
  createDbRecipeRating,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { noInitiator } from "@/__tests__/helpers.js";
import { FavoriteModel } from "./favorite.model.js";
import { FavoriteRepository } from "./favorite.repository.js";

describe("FavoriteRepository", () => {
  const repository = new FavoriteRepository(FavoriteModel);

  describe("findByUser", () => {
    it("should return favorited recipes with populated data", async () => {
      const user = await createDbUser({ name: "Alice" });
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({ name: "Italian" });
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Pasta",
        isPublic: true,
      });

      await createDbFavorite({ user: user._id, recipe: recipe._id });

      const [recipes, total] = await repository.findByUser(
        user._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(1);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.title).toBe("Pasta");
      expect(recipes[0]?.author.name).toBe("Chef");
      expect(recipes[0]?.category.name).toBe("Italian");
    });

    it("should NOT show private recipes of other users", async () => {
      const user = await createDbUser();
      const otherAuthor = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: otherAuthor._id,
        category: category._id,
        isPublic: false,
      });

      await createDbFavorite({ user: user._id, recipe: recipe._id });

      const [recipes, total] = await repository.findByUser(
        user._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(0);
      expect(recipes).toEqual([]);
    });

    it("should show own private recipes", async () => {
      const user = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: user._id,
        category: category._id,
        isPublic: false,
      });

      await createDbFavorite({ user: user._id, recipe: recipe._id });

      const [recipes, total] = await repository.findByUser(
        user._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: {
            id: user._id.toString(),
            role: "user",
          },
        },
      );

      expect(total).toBe(1);
      expect(recipes[0]?.title).toBeDefined();
    });

    it("should return averageRating and userRating when available", async () => {
      const user = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });
      const otherUser = await createDbUser();

      await createDbFavorite({ user: user._id, recipe: recipe._id });
      await createDbRecipeRating({
        user: user._id,
        recipe: recipe._id,
        value: 4,
      });
      await createDbRecipeRating({
        user: otherUser._id,
        recipe: recipe._id,
        value: 5,
      });

      const [recipes] = await repository.findByUser(user._id.toString(), {
        query: { page: 1, limit: 10 },
        initiator: {
          id: user._id.toString(),
          role: "user",
        },
      });

      expect(recipes[0]?.userRating).toBe(4);
      expect(recipes[0]?.averageRating).toBe(4.5);
      expect(recipes[0]?.ratingCount).toBe(2);
    });

    it("should paginate correctly", async () => {
      const user = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();

      const recipe1 = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });
      const recipe2 = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      await createDbFavorite({ user: user._id, recipe: recipe1._id });
      await createDbFavorite({ user: user._id, recipe: recipe2._id });

      const [recipes, total] = await repository.findByUser(
        user._id.toString(),
        {
          query: { page: 2, limit: 1 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(2);
      expect(recipes).toHaveLength(1);
    });

    it("should return empty when no favorites", async () => {
      const user = await createDbUser();

      const [recipes, total] = await repository.findByUser(
        user._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(0);
      expect(recipes).toEqual([]);
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a favorite", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        user: user._id.toString(),
        recipe: recipe._id.toString(),
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
    });

    it("should delete a favorite by id", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        user: user._id.toString(),
        recipe: recipe._id.toString(),
      });

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
