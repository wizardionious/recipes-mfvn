import type { RecipeComputed, RequireKeys } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  extractTotalCountResult,
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import {
  byVisibility,
  withAuthor,
  withAverageRating,
  withCategories,
  withUserRating,
} from "@/modules/recipes/recipe.aggregation.js";
import type { RecipeDocumentPopulated } from "@/modules/recipes/recipe.model.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { FavoriteDocument } from "./favorite.model.js";

export type FavoriteCreateInput = RequireKeys<
  CreateInput<FavoriteDocument>,
  "user" | "recipe"
>;
export type FavoriteUpdateInput = UpdateInput<FavoriteDocument>;

export class FavoriteRepository extends BaseRepository<
  FavoriteDocument,
  FavoriteCreateInput,
  FavoriteUpdateInput
> {
  async findByUser(
    userId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[Array<RecipeDocumentPopulated & RecipeComputed>, number]> {
    const result = await this.aggregate<
      WithTotalCountResult<{ recipe: RecipeDocumentPopulated & RecipeComputed }>
    >([
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
    ]);

    const [favorites, total] = extractTotalCountResult(result);
    const recipes = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe != null);

    return [recipes, total];
  }
}

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
          ...withUserRating(initiator.id),
          ...withAverageRating(),
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}
