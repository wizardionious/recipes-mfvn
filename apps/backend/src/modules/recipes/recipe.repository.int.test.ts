import { describe, expect, it } from "vitest";
import {
  createDbCategory,
  createDbFavorite,
  createDbRecipe,
  createDbRecipeRating,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { RecipeModel } from "./recipe.model.js";
import { RecipeRepository } from "./recipe.repository.js";

describe("RecipeRepository", () => {
  const repository = new RecipeRepository(RecipeModel);

  describe("aggregateSearch", () => {
    it("should return public recipes with populated data", async () => {
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({
        name: "Italian",
        image: {
          url: "https://example.com/italian.jpg",
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Pasta",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.title).toBe("Pasta");
      expect(recipes[0]?.author.name).toBe("Chef");
      expect(recipes[0]?.category.name).toBe("Italian");
      expect(recipes[0]?.category.image.url).toBe(
        "https://example.com/italian.jpg",
      );
    });

    it("should NOT show private recipes when unauthenticated", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(0);
      expect(recipes).toEqual([]);
    });

    it("should show own private recipes to the author", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Secret",
        isPublic: false,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: {
          id: author._id.toString(),
          role: "user",
        },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.title).toBe("Secret");
    });

    it("should show all recipes to admin", async () => {
      const author = await createDbUser();
      const admin = await createDbUser({ role: "admin" });
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const [, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: {
          id: admin._id.toString(),
          role: "admin",
        },
      });

      expect(total).toBe(1);
    });

    it("should filter by categoryId", async () => {
      const author = await createDbUser();
      const catA = await createDbCategory({ name: "A" });
      const catB = await createDbCategory({ name: "B" });
      await createDbRecipe({
        author: author._id,
        category: catA._id,
        title: "Recipe A",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: catB._id,
        title: "Recipe B",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          categoryId: catA._id.toString(),
        },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.title).toBe("Recipe A");
    });

    it("should filter by difficulty", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        difficulty: "easy",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        difficulty: "hard",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          difficulty: "hard",
        },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.difficulty).toBe("hard");
    });

    it("should filter by isFavorited", async () => {
      const user = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });
      await createDbFavorite({ user: user._id, recipe: recipe._id });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          isFavorited: true,
        },
        initiator: {
          id: user._id.toString(),
          role: "user",
        },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.isFavorited).toBe(true);
    });

    it("should return ratings data", async () => {
      const user = await createDbUser();
      const otherUser = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });
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

      const [recipes] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
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
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "First",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Second",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 2, limit: 1, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(2);
      expect(recipes).toHaveLength(1);
    });
  });

  describe("aggregateById", () => {
    it("should return recipe by id with populated data", async () => {
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({ name: "Desserts" });
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Cake",
        isPublic: true,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: { id: undefined, role: undefined },
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Cake");
      expect(result?.author.name).toBe("Chef");
      expect(result?.category.name).toBe("Desserts");
    });

    it("should return undefined for private recipe when unauthenticated", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: { id: undefined, role: undefined },
      });

      expect(result).toBeUndefined();
    });

    it("should return own private recipe to the author", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Secret",
        isPublic: false,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: {
          id: author._id.toString(),
          role: "user",
        },
      });

      expect(result?.title).toBe("Secret");
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a recipe", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();

      const created = await repository.create({
        title: "New Recipe",
        description: "Desc",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix"],
        category: category._id.toString(),
        author: author._id.toString(),
        difficulty: "easy",
        cookingTime: 30 as never,
        servings: 2,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.title).toBe("New Recipe");
    });

    it("should delete a recipe by id", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();

      const created = await repository.create({
        title: "To Delete",
        description: "Desc",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix"],
        category: category._id.toString(),
        author: author._id.toString(),
        difficulty: "easy",
        cookingTime: 30 as never,
        servings: 2,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
      });

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
