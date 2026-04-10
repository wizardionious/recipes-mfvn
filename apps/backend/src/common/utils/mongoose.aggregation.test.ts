import { describe, expect, it } from "vitest";

const { withSort, withPagination, withTotalCount } = await import(
  "@/common/utils/mongoose.aggregation.js"
);

describe("withSort", () => {
  it("should return createdAt descending sort by default", () => {
    const result = withSort();

    expect(result).toEqual([{ $sort: { createdAt: -1 } }]);
  });

  it("should return ascending sort when no minus prefix", () => {
    const result = withSort("name");

    expect(result).toEqual([{ $sort: { name: 1 } }]);
  });

  it("should handle descending sort with prefix", () => {
    const result = withSort("-updatedAt");

    expect(result).toHaveLength(1);
    expect(result).toEqual([{ $sort: { updatedAt: -1 } }]);
  });
});

describe("withPagination", () => {
  it("should return $skip and $limit stages", () => {
    const result = withPagination(1, 10);

    expect(result).toHaveLength(2);
    expect(result).toEqual([{ $skip: 0 }, { $limit: 10 }]);
  });

  it("should calculate correct skip for page 3 with limit 20", () => {
    const result = withPagination(3, 20);

    expect(result).toHaveLength(2);
    expect(result).toEqual([{ $skip: 40 }, { $limit: 20 }]);
  });

  it("should skip 0 for page 1", () => {
    const result = withPagination(1, 5);

    expect(result).toHaveLength(2);
    expect(result).toEqual([{ $skip: 0 }, { $limit: 5 }]);
  });
});

describe("withTotalCount", () => {
  it("should wrap pipelines in $facet with total count", () => {
    const pipeline = { $sort: { createdAt: -1 } } as const;
    const result = withTotalCount(pipeline);

    expect(result[0]?.$facet?.items).toHaveLength(1);
    expect(result[0]?.$facet?.items[0]).toEqual(pipeline);
  });

  it("should handle multiple pipeline stages", () => {
    const result = withTotalCount(
      { $sort: { name: 1 } },
      { $skip: 0 },
      { $limit: 10 },
    );

    expect(result[0]?.$facet?.items).toHaveLength(3);
  });
});
