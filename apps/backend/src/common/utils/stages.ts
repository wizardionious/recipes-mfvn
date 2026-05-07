import { getSortObject } from "@recipes/shared";
import type {
  AnyExpression,
  BooleanExpression,
  Expression,
  PipelineStage,
  QueryFilter,
  Types,
} from "mongoose";

export function cond(
  _if: BooleanExpression,
  _then: AnyExpression,
  _else: AnyExpression,
): Expression.Cond {
  return {
    $cond: [_if, _then, _else],
  };
}

export type UnsetStage<T> =
  | (keyof T extends string ? keyof T : never)[]
  | string[];
export function unset<T extends { _id: Types.ObjectId }>(
  ...paths: UnsetStage<T>
): PipelineStage.Unset {
  return { $unset: paths };
}

export function match<T extends { _id: Types.ObjectId }>(
  filter: QueryFilter<T>,
): PipelineStage.Match {
  return { $match: filter as QueryFilter<unknown> };
}

export function skip(skip: number): PipelineStage.Skip {
  return { $skip: skip };
}

export function limit(limit: number): PipelineStage.Limit {
  return { $limit: limit };
}

export function paginate(
  page: number,
  limit: number,
): [PipelineStage.Skip, PipelineStage.Limit] {
  return [{ $skip: (page - 1) * limit }, { $limit: limit }];
}

export type SortStage = string | Record<string, 1 | -1>;
export function sort(sort: SortStage = { createdAt: -1 }): PipelineStage.Sort {
  if (typeof sort === "string") {
    return { $sort: getSortObject(sort) };
  }

  return {
    $sort: sort,
  };
}

export function group(pipeline: PipelineStage.Group["$group"]) {
  return {
    $group: {
      ...pipeline,
    },
  };
}

export function project(
  fields: Record<string, 1 | 0> | Expression,
): PipelineStage.Project {
  return { $project: fields };
}

export function addFields(
  fields: PipelineStage.AddFields["$addFields"],
): PipelineStage.AddFields {
  return { $addFields: fields };
}

function parseUnwind(unwind: boolean | { required?: boolean }): boolean {
  return typeof unwind === "boolean" ? unwind : !unwind.required;
}

export function lookup(
  lookup: PipelineStage.Lookup["$lookup"],
  unwind?:
    | {
        required?: boolean;
      }
    | boolean,
): [PipelineStage.Lookup] | [PipelineStage.Lookup, PipelineStage.Unwind] {
  const lookupPipeline: PipelineStage.Lookup = {
    $lookup: {
      from: lookup.from,
      localField: lookup.localField,
      foreignField: lookup.foreignField,
      let: lookup.let ?? {},
      pipeline: lookup.pipeline ?? [],
      as: lookup.as,
    },
  };

  if (!unwind) {
    return [lookupPipeline];
  }

  return [
    lookupPipeline,
    {
      $unwind: {
        path: `$${lookup.as}`,
        preserveNullAndEmptyArrays: parseUnwind(unwind),
      },
    },
  ];
}

/**
 * Type representing the result of a paginated aggregation pipeline.
 *
 * @template T - The type of the items in the result.
 */
export type PaginatedStageResult<T> = {
  items: T[];
  total: number;
};

/**
 * Creates a facet pipeline stage that paginates the results.
 *
 * @param options - The pagination options.
 * @param pipelines - The pipeline to apply before pagination.
 * @returns A pipeline stage that paginates the results.
 */
export function paginated(
  options: {
    sort?: SortStage;
    page: number;
    limit: number;
  },
  ...pipelines: PipelineStage.FacetPipelineStage[]
): [PipelineStage.Facet, PipelineStage.Project] {
  const sortPipeline = options.sort ? sort(options.sort) : [];

  return [
    {
      $facet: {
        items: [
          sortPipeline,
          paginate(options.page, options.limit),
          pipelines,
        ].flat(),
        meta: [{ $count: "totalCount" }],
      },
    },
    {
      $project: {
        items: 1,
        total: {
          $ifNull: [{ $first: "$meta.totalCount" }, 0],
        },
      },
    },
  ];
}

export function extractPaginatedResult<T>(
  result: PaginatedStageResult<T>[],
): [T[], number] {
  if (!result.length || !result[0]?.items.length) {
    return [[], result[0]?.total ?? 0];
  }
  return [result[0].items, result[0].total];
}

export default {
  cond,
  unset,
  match,
  skip,
  limit,
  paginate,
  sort,
  group,
  project,
  addFields,
  lookup,
  paginated,
  extractPaginatedResult,
};
