import type { PipelineStage } from "mongoose";
import type {
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import {
  byVisibility,
  withAuthor,
} from "@/modules/recipes/recipe.aggregation.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";

export type FindFullByAuthor = { by: "author"; authorId: string };
export type FindFullByRecipe = { by: "recipe"; recipeId: string };
export type FindFullFilter = FindFullByAuthor | FindFullByRecipe;

function withRecipe(
  initiator: OptionalInitiator,
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
        from: recipesCollectionName,
        localField: "recipe",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...byVisibility(initiator),
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
            },
          },
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}

export function buildFindPipeline(
  filter: FindFullFilter,
  { query, initiator }: QueryMethodParams,
): PipelineStage[] {
  return [
    {
      $match: {
        ...(filter.by === "recipe"
          ? { recipe: toObjectId(filter.recipeId) }
          : { author: toObjectId(filter.authorId) }),
      },
    },
    { $unset: "__v" },
    ...withAuthor(),
    ...withRecipe(initiator),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(query.page, query.limit),
    ),
  ];
}
