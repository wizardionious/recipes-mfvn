import { describe, expect, it } from "vitest";
import { createCategoryDoc } from "@/__tests__/helpers.js";
import { toCategory, toCategorySummary } from "./category.mapper.js";

describe("toCategorySummary", () => {
  it("should map CategorySummaryView to CategorySummary DTO", () => {
    const doc = createCategoryDoc({
      name: "Desserts",
      slug: "desserts",
    });

    const result = toCategorySummary(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      name: "Desserts",
      slug: "desserts",
      image: { url: "https://example.com/category.jpg", alt: "Desserts" },
    });
  });

  it("should use name as alt fallback when alt is missing", () => {
    const doc = createCategoryDoc({
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg" },
    });

    const result = toCategorySummary(doc);

    expect(result.image.alt).toBe("Italian");
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
      image: { url: "https://example.com/category.jpg", alt: "Desserts" },
      recipeCount: 0,
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
