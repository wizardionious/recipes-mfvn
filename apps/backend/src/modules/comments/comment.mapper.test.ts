import { describe, expect, it } from "vitest";
import { createCommentDoc, createObjectId } from "@/__tests__/helpers.js";
import { toComment } from "./comment.mapper.js";

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
