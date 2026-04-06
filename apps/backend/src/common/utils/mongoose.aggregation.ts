import type { PipelineStage } from "mongoose";

export function withSort(
  sort: string = "-createdAt",
): PipelineStage.FacetPipelineStage[] {
  const desc = sort.startsWith("-");
  const sortName = desc ? sort.slice(1) : sort;
  const sortOrder = desc ? -1 : 1;

  return [
    {
      $sort: { [sortName]: sortOrder },
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
