import type { PipelineStage } from "mongoose";
import {
  byVisibility,
  withAuthor,
  withCategories,
} from "@/modules/recipes/index.js";

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
