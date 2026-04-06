import type { PipelineStage } from "mongoose";
import { byVisibility } from "@/modules/recipes/index.js";

export function withRecipe(
  userId: string | undefined,
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
        from: "recipes",
        localField: "recipe",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...byVisibility(userId),
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
