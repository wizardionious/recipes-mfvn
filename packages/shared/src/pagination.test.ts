import { describe, expect, it } from "vitest";
import { withPagination } from "./pagination";

describe("withPagination", () => {
  it("should return paginated items with next page", () => {
    const items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const total = items.length;
    const page = 1;
    const limit = 5;

    const result = withPagination(items, total, page, limit);

    expect(result.items).toEqual(items);
    expect(result.pagination).toEqual({
      page,
      limit,
      total,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
  });

  it("should return paginated items with previous page", () => {
    const items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const total = items.length;
    const page = 2;
    const limit = 5;

    const result = withPagination(items, total, page, limit);

    expect(result.items).toEqual(items);
    expect(result.pagination).toEqual({
      page,
      limit,
      total,
      totalPages: 2,
      hasNext: false,
      hasPrev: true,
    });
  });

  it("should return paginated items with prev/next pages", () => {
    const items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const total = items.length;
    const page = 2;
    const limit = 3;

    const result = withPagination(items, total, page, limit);

    expect(result.items).toEqual(items);
    expect(result.pagination).toEqual({
      page,
      limit,
      total,
      totalPages: 4,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("should return empty array when no items", () => {
    const items: number[] = [];
    const total = 0;
    const page = 1;
    const limit = 20;

    const result = withPagination(items, total, page, limit);

    expect(result.items).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});
