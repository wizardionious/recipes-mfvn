import type { Minutes } from "@recipes/shared";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import {
  createCategoryDoc,
  createCommentDoc,
  createObjectId,
  createRecipeDoc,
  createUserDoc,
} from "@/__tests__/helpers.js";
import {
  toCategory,
  toComment,
  toCommentForRecipe,
  toObjectId,
  toRecipe,
  toUser,
} from "@/common/utils/mongo.js";
import type { RecipeDocumentPopulated } from "@/modules/recipes/recipe.model.js";

describe("toObjectId", () => {
  it("should convert a valid hex string to ObjectId", () => {
    const hex = "507f1f77bcf86cd799439011";
    const result = toObjectId(hex);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toHexString()).toBe(hex);
  });

  it("should throw on invalid hex string", () => {
    expect(() => toObjectId("invalid")).toThrow();
  });
});

describe("toCategory", () => {
  it("should map CategoryDocument to Category DTO", () => {
    const doc = createCategoryDoc({
      name: "Desserts",
      slug: "desserts",
      description: "Sweet dishes",
    });

    const result = toCategory(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      name: "Desserts",
      slug: "desserts",
      description: "Sweet dishes",
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });
  });

  it("should handle optional description", () => {
    const doc = createCategoryDoc({ description: undefined });

    const result = toCategory(doc);

    expect(result.description).toBeUndefined();
  });
});

describe("toUser", () => {
  it("should map UserDocument to User DTO", () => {
    const doc = createUserDoc({
      email: "john@test.com",
      name: "John",
    });

    const result = toUser(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      email: "john@test.com",
      name: "John",
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });
  });

  it("should not expose password field", () => {
    const doc = createUserDoc();

    const result = toUser(doc);

    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("role");
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
      },
      author: {
        _id: authorId,
        name: "Chef",
        email: "chef@test.com",
      },
      isFavorited: true,
    } satisfies RecipeDocumentPopulated;

    const result = toRecipe(doc, doc.isFavorited);

    expect(result.id).toBe(doc._id.toString());
    expect(result.title).toBe("Pasta");
    expect(result.isFavorited).toBe(doc.isFavorited);
    expect(result.category).toEqual({
      id: categoryId.toString(),
      name: "Italian",
      slug: "italian",
    });
    expect(result.author).toEqual({
      id: authorId.toString(),
      email: "chef@test.com",
      name: "Chef",
    });
  });

  it("should map isFavorited=false", () => {
    const doc = {
      ...createRecipeDoc(),
      category: { _id: createObjectId(), name: "Cat", slug: "cat" },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
    };

    const result = toRecipe(doc, false);

    expect(result.isFavorited).toBe(false);
  });
});

describe("toComment", () => {
  it("should map comment document to Comment DTO with recipe", () => {
    const authorId = createObjectId();
    const recipeId = createObjectId();
    const doc = {
      ...createCommentDoc({ text: "Nice!" }),
      author: { _id: authorId, name: "User", email: "user@test.com" },
      recipe: { _id: recipeId, title: "Pasta" },
    };

    const result = toComment(doc);

    expect(result.text).toBe("Nice!");
    expect(result.author).toEqual({
      id: authorId.toString(),
      email: "user@test.com",
      name: "User",
    });
    expect(result.recipe).toEqual({
      id: recipeId.toString(),
      title: "Pasta",
    });
  });
});

describe("toCommentForRecipe", () => {
  it("should map comment document to CommentForRecipe DTO (no recipe field)", () => {
    const authorId = createObjectId();
    const doc = {
      ...createCommentDoc({ text: "Great!" }),
      author: { _id: authorId, name: "User", email: "user@test.com" },
    };

    const result = toCommentForRecipe(doc);

    expect(result.text).toBe("Great!");
    expect(result).not.toHaveProperty("recipe");
    expect(result.author.id).toBe(authorId.toString());
  });
});
