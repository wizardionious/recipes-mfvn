import { describe, expect, it } from "vitest";
import stages, {
  addFields,
  cond,
  extractPaginatedResult,
  group,
  limit,
  lookup,
  match,
  paginate,
  paginated,
  project,
  skip,
  sort,
  unset,
} from "./stages.js";

describe("unset", () => {
  it("should create a single-field unset stage", () => {
    expect(unset("__v")).toEqual({ $unset: ["__v"] });
  });

  it("should create a multi-field unset stage", () => {
    expect(unset("__v", "password")).toEqual({
      $unset: ["__v", "password"],
    });
  });
});

describe("match", () => {
  it("should create a match stage", () => {
    expect(match({ isPublic: true })).toEqual({ $match: { isPublic: true } });
  });
});

describe("skip", () => {
  it("should create a skip stage", () => {
    expect(skip(20)).toEqual({ $skip: 20 });
  });
});

describe("limit", () => {
  it("should create a limit stage", () => {
    expect(limit(10)).toEqual({ $limit: 10 });
  });
});

describe("paginate", () => {
  it("should create skip and limit stages for page 1", () => {
    expect(paginate(1, 10)).toEqual([{ $skip: 0 }, { $limit: 10 }]);
  });

  it("should create skip and limit stages for page 3", () => {
    expect(paginate(3, 5)).toEqual([{ $skip: 10 }, { $limit: 5 }]);
  });
});

describe("sort", () => {
  it("should create a sort stage from a string", () => {
    expect(sort("-createdAt")).toEqual({ $sort: { createdAt: -1 } });
  });

  it("should create a sort stage from an object", () => {
    expect(sort({ name: 1 })).toEqual({ $sort: { name: 1 } });
  });

  it("should default to createdAt desc", () => {
    expect(sort()).toEqual({ $sort: { createdAt: -1 } });
  });
});

describe("lookup", () => {
  it("should create lookup + required unwind stages", () => {
    const [lookupStage, unwindStage] = lookup(
      {
        from: "users",
        localField: "author",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "author",
      },
      { required: true },
    );

    expect(lookupStage).toEqual({
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        let: {},
        pipeline: [{ $project: { name: 1 } }],
        as: "author",
      },
    });
    expect(unwindStage).toEqual({
      $unwind: { path: "$author", preserveNullAndEmptyArrays: false },
    });
  });

  it("should create lookup + optional unwind stages", () => {
    const [, unwindStage] = lookup(
      {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
      { required: false },
    );

    expect(unwindStage).toEqual({
      $unwind: { path: "$author", preserveNullAndEmptyArrays: true },
    });
  });

  it("should default to optional unwind with empty options", () => {
    const [, unwindStage] = lookup(
      {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
      {},
    );

    expect(unwindStage).toEqual({
      $unwind: { path: "$author", preserveNullAndEmptyArrays: true },
    });
  });

  it("should return only lookup when no unwind", () => {
    const result = lookup(
      {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("$lookup");
  });
});

describe("project", () => {
  it("should create a project stage", () => {
    expect(project({ name: 1, email: 1 })).toEqual({
      $project: { name: 1, email: 1 },
    });
  });
});

describe("addFields", () => {
  it("should create an addFields stage", () => {
    expect(addFields({ recipeCount: { $size: "$recipes" } })).toEqual({
      $addFields: { recipeCount: { $size: "$recipes" } },
    });
  });
});

describe("group", () => {
  it("should create a group stage", () => {
    expect(group({ _id: null, total: { $sum: 1 } })).toEqual({
      $group: { _id: null, total: { $sum: 1 } },
    });
  });
});

describe("cond", () => {
  it("should create a cond expression", () => {
    expect(cond({ $gte: ["$rating", 4] }, 1, 0)).toEqual({
      $cond: [{ $gte: ["$rating", 4] }, 1, 0],
    });
  });
});

describe("paginated", () => {
  it("should create facet + project stages with sort and pagination", () => {
    const [facet, projectStage] = paginated(
      { sort: "-createdAt", page: 2, limit: 10 },
      match({ isPublic: true }),
    );

    expect(facet).toEqual({
      $facet: {
        items: [
          { $sort: { createdAt: -1 } },
          { $skip: 10 },
          { $limit: 10 },
          { $match: { isPublic: true } },
        ],
        meta: [{ $count: "totalCount" }],
      },
    });

    expect(projectStage).toEqual({
      $project: {
        items: 1,
        total: { $ifNull: [{ $first: "$meta.totalCount" }, 0] },
      },
    });
  });

  it("should create facet + project stages without sort", () => {
    const [facet] = paginated({ page: 1, limit: 5 });

    expect(facet).toEqual({
      $facet: {
        items: [{ $skip: 0 }, { $limit: 5 }],
        meta: [{ $count: "totalCount" }],
      },
    });
  });
});

describe("extractPaginatedResult", () => {
  it("should extract items and total", () => {
    const result = extractPaginatedResult([{ items: [{ id: "1" }], total: 1 }]);

    expect(result).toEqual([[{ id: "1" }], 1]);
  });

  it("should handle empty result", () => {
    const result = extractPaginatedResult([]);

    expect(result).toEqual([[], 0]);
  });

  it("should handle result with no items", () => {
    const result = extractPaginatedResult([{ items: [], total: 0 }]);

    expect(result).toEqual([[], 0]);
  });
});

describe("stages default export", () => {
  it("should expose all helpers", () => {
    expect(stages.cond).toBe(cond);
    expect(stages.unset).toBe(unset);
    expect(stages.match).toBe(match);
    expect(stages.skip).toBe(skip);
    expect(stages.limit).toBe(limit);
    expect(stages.paginate).toBe(paginate);
    expect(stages.sort).toBe(sort);
    expect(stages.group).toBe(group);
    expect(stages.project).toBe(project);
    expect(stages.addFields).toBe(addFields);
    expect(stages.lookup).toBe(lookup);
    expect(stages.paginated).toBe(paginated);
    expect(stages.extractPaginatedResult).toBe(extractPaginatedResult);
  });
});
