import type { CategoryQuery } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import { withSort } from "@/common/utils/mongoose.aggregation.js";
import { recipesCollectionName } from "../recipes/recipe.model.js";

export function buildSearchPipeline(
  query: CategoryQuery,
  withCount = true,
): PipelineStage[] {
  return [
    ...(withCount
      ? [
          {
            $lookup: {
              from: recipesCollectionName,
              localField: "_id",
              foreignField: "category",
              as: "recipes",
            },
          },
          { $addFields: { recipeCount: { $size: "$recipes" } } },
          { $project: { recipes: 0 } },
        ]
      : []),
    ...withSort(query.sort),
  ];
}
