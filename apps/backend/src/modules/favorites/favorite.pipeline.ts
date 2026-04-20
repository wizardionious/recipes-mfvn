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
  withCategories,
} from "@/modules/recipes/recipe.aggregation.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";

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
          { $unset: "__v" },
          ...withCategories(),
          ...withAuthor(),
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}

export function buildFindByUserPipeline(
  userId: string,
  { query, initiator }: QueryMethodParams,
): PipelineStage[] {
  return [
    {
      $match: {
        user: toObjectId(userId),
      },
    },
    { $unset: ["__v", "user"] },
    ...withRecipe(initiator),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(query.page, query.limit),
    ),
  ];
}
