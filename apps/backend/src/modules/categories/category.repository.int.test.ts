import { describe, expect, it } from "vitest";
import {
  createDbCategory,
  createDbRecipe,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { CategoryModel } from "./category.model.js";
import { CategoryRepository } from "./category.repository.js";

describe("CategoryRepository", () => {
  const repository = new CategoryRepository(CategoryModel);

  describe("findMany", () => {
    it("should return categories with correct recipeCount", async () => {
      const categoryA = await createDbCategory({ name: "Desserts" });
      const categoryB = await createDbCategory({ name: "Soups" });
      const user = await createDbUser();

      await createDbRecipe({ category: categoryA._id, author: user._id });
      await createDbRecipe({ category: categoryA._id, author: user._id });
      await createDbRecipe({ category: categoryB._id, author: user._id });

      const [items, total] = await repository.findMany({
        sort: "name",
        page: 1,
        limit: 10,
      });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);

      const desserts = items.find((c) => c.name === "Desserts");
      const soups = items.find((c) => c.name === "Soups");

      expect(desserts?.recipeCount).toBe(2);
      expect(soups?.recipeCount).toBe(1);
    });

    it("should return empty result when no categories exist", async () => {
      const [items, total] = await repository.findMany({
        sort: "name",
        page: 1,
        limit: 10,
      });

      expect(items).toEqual([]);
      expect(total).toBe(0);
    });

    it("should paginate correctly", async () => {
      await createDbCategory({ name: "A-Category" });
      await createDbCategory({ name: "B-Category" });
      await createDbCategory({ name: "C-Category" });

      const [items, total] = await repository.findMany({
        sort: "name",
        page: 2,
        limit: 1,
      });

      expect(total).toBe(3);
      expect(items).toHaveLength(1);
      expect(items[0]?.name).toBe("B-Category");
    });

    it("should sort by name ascending", async () => {
      await createDbCategory({ name: "Zebra" });
      await createDbCategory({ name: "Apple" });
      await createDbCategory({ name: "Mango" });

      const [items] = await repository.findMany({
        sort: "name",
        page: 1,
        limit: 10,
      });

      expect(items.map((c) => c.name)).toEqual(["Apple", "Mango", "Zebra"]);
    });

    it("should sort by name descending", async () => {
      await createDbCategory({ name: "Zebra" });
      await createDbCategory({ name: "Apple" });
      await createDbCategory({ name: "Mango" });

      const [items] = await repository.findMany({
        sort: "-name",
        page: 1,
        limit: 10,
      });

      expect(items.map((c) => c.name)).toEqual(["Zebra", "Mango", "Apple"]);
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a category", async () => {
      const created = await repository.create({
        name: "Test Category",
        slug: "test-category",
        description: "Desc",
        image: { url: "https://example.com/cat.jpg" },
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.name).toBe("Test Category");
      expect(found?.slug).toBe("test-category");
    });

    it("should update a category", async () => {
      const created = await repository.create({
        name: "Old Name",
        slug: "old-name",
        image: { url: "https://example.com/old.jpg" },
      });

      const updated = await repository.update(created._id.toString(), {
        name: "New Name",
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("New Name");
    });

    it("should delete a category by id", async () => {
      const created = await repository.create({
        name: "To Delete",
        slug: "to-delete",
        image: { url: "https://example.com/del.jpg" },
      });

      const deleted = await repository.delete(created._id.toString());

      expect(deleted).not.toBeNull();
      expect(deleted?.name).toBe("To Delete");

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
