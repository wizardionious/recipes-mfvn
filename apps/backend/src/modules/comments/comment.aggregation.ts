import type { PipelineStage } from "mongoose";
import type { OptionalInitiator } from "@/common/types/methods.js";
import { byVisibility } from "@/modules/recipes/recipe.aggregation.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";

export function withRecipe(
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
