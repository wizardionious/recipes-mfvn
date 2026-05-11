import type { Minutes, RecipeComputed } from "@recipes/shared";
import { describe, expect, it } from "vitest";
import { createObjectId, createRecipeDoc } from "@/__tests__/helpers.js";
import { toRecipe, toRecipeSummary } from "./recipe.mapper.js";
import type { RecipeDocumentPopulated } from "./recipe.model.js";

describe("toRecipeSummary", () => {
  it("should map RecipeSummaryView to RecipeSummary DTO", () => {
    const doc = {
      _id: createObjectId(),
      title: "Pasta Carbonara",
    };

    const result = toRecipeSummary(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      title: "Pasta Carbonara",
    });
  });
});

describe("toRecipe", () => {
  it("should map recipe document to Recipe DTO", () => {
    const categoryId = createObjectId();
    const authorId = createObjectId();
    const doc = {
      ...createRecipeDoc({
        title: "Pasta",
        description: "Delicious pasta",
        difficulty: "easy",
        cookingTime: 30 as Minutes,
        servings: 4,
        isPublic: true,
      }),
      category: {
        _id: categoryId,
        name: "Italian",
        slug: "italian",
        image: { url: "https://example.com/italian.jpg" },
      },
      author: {
        _id: authorId,
        name: "Chef",
        email: "chef@test.com",
      },
      isFavorited: true,
      userRating: 4,
      averageRating: 4.2,
      ratingCount: 10,
    } satisfies RecipeDocumentPopulated & RecipeComputed;

    const result = toRecipe(doc, doc.isFavorited);

    expect(result.id).toBe(doc._id.toString());
    expect(result.title).toBe("Pasta");
    expect(result.isFavorited).toBe(doc.isFavorited);
    expect(result.category).toEqual({
      id: categoryId.toString(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg", alt: "Italian" },
    });
    expect(result.author).toEqual({
      id: authorId.toString(),
      email: "chef@test.com",
      name: "Chef",
    });
    expect(result.userRating).toBe(4);
    expect(result.averageRating).toBe(4.2);
    expect(result.ratingCount).toBe(10);
  });

  it("should default rating fields when missing", () => {
    const doc = {
      ...createRecipeDoc(),
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
    };

    const result = toRecipe(doc, false);

    expect(result.userRating).toBeNull();
    expect(result.averageRating).toBeNull();
    expect(result.ratingCount).toBe(0);
  });

  it("should map isFavorited=false", () => {
    const doc = {
      ...createRecipeDoc(),
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
    };

    const result = toRecipe(doc, false);

    expect(result.isFavorited).toBe(false);
  });
});
