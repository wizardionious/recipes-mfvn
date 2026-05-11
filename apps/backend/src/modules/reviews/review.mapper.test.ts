import { describe, expect, it } from "vitest";
import { createObjectId, createReviewDoc } from "@/__tests__/helpers.js";
import { toReview } from "./review.mapper.js";

describe("toReview", () => {
  it("should map ReviewDocument to Review DTO", () => {
    const doc = {
      ...createReviewDoc({ text: "Amazing platform!", isFeatured: true }),
      author: {
        _id: createObjectId(),
        name: "Alice",
        email: "alice@test.com",
      },
    };

    const result = toReview(doc);

    expect(result.text).toBe("Amazing platform!");
    expect(result.isFeatured).toBe(true);
    expect(result.author).toEqual({
      id: doc.author._id.toString(),
      name: "Alice",
      email: "alice@test.com",
    });
  });
});
