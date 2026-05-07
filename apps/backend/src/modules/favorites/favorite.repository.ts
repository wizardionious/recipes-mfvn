import type { RecipeComputed, RequireKeys } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
import {
  byVisibility,
  withAuthor,
  withAverageRating,
  withCategories,
  withUserRating,
} from "@/modules/recipes/recipe.aggregation.js";
import type {
  RecipeDocument,
  RecipeDocumentPopulated,
} from "@/modules/recipes/recipe.model.js";
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
    const pipeline = [
      stages.match<FavoriteDocument>({
        user: toObjectId(userId),
      }),
      stages.unset<FavoriteDocument>("__v", "user"),
      withRecipe(initiator),
      stages.paginated({
        sort: "-createdAt",
        page: query.page,
        limit: query.limit,
      }),
    ].flat();

    const result =
      await this.aggregate<
        PaginatedStageResult<{
          recipe: RecipeDocumentPopulated & RecipeComputed;
        }>
      >(pipeline);

    const [favorites, total] = extractPaginatedResult(result);
    const recipes = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe != null);

    return [recipes, total];
  }
}

function withRecipe(
  initiator: OptionalInitiator,
): PipelineStage.FacetPipelineStage[] {
  return stages.lookup(
    {
      from: recipesCollectionName,
      localField: "recipe",
      foreignField: "_id",
      pipeline: [
        stages.match<RecipeDocument>({
          ...byVisibility(initiator),
        }),
        stages.unset<RecipeDocument>("__v"),
        withCategories(),
        withAuthor(),
        withUserRating(initiator.id),
        withAverageRating(),
      ].flat(),
      as: "recipe",
    },
    { required: true },
  );
}
