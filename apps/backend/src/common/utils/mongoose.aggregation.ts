import { getSortObject } from "@recipes/shared";
import type { PipelineStage } from "mongoose";

export function withSort(
  sort: string = "-createdAt",
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $sort: getSortObject(sort),
    },
  ];
}

export function withPagination(
  page: number,
  limit: number,
): PipelineStage.FacetPipelineStage[] {
  return [{ $skip: (page - 1) * limit }, { $limit: limit }];
}

export type WithTotalCountResult<T> = {
  items: T[];
  total: number;
};

export function withTotalCount(
  ...pipelines: PipelineStage.FacetPipelineStage[]
) {
  return [
    {
      $facet: {
        items: pipelines,
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

export function extractTotalCountResult<T>(
  result: WithTotalCountResult<T>[],
): [T[], number] {
  if (!result.length || !result[0]?.items.length) {
    return [[], result[0]?.total ?? 0];
  }
  return [result[0].items, result[0].total];
}
