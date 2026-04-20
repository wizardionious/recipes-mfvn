import type { RecipeQuery } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import type {
  InitiatedMethodParams,
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
  withAverageRating,
  withCategories,
  withFavorited,
  withUserRating,
} from "./recipe.aggregation.js";

export function buildSearchPipeline({
  query,
  initiator,
}: QueryMethodParams<RecipeQuery>): PipelineStage[] {
  const { page, limit, sort, isFavorited, search, categoryId, difficulty } =
    query;

  return [
    {
      $match: {
        ...byVisibility(initiator),
        ...(search && { $text: { $search: search } }),
        ...(categoryId && { category: categoryId }),
        ...(difficulty && { difficulty }),
      },
    },
    { $unset: "__v" },

    ...withFavorited(initiator.id),
    ...withUserRating(initiator.id),
    ...withAverageRating(),
    {
      $match: {
        ...(isFavorited !== undefined && { isFavorited }),
      },
    },

    ...withTotalCount(
      ...withSort(sort),
      ...withPagination(page, limit),
      ...withCategories(),
      ...withAuthor(),
    ),
  ];
}

export function buildFindByIdPipeline(
  id: string,
  { initiator }: InitiatedMethodParams<OptionalInitiator>,
): PipelineStage[] {
  return [
    {
      $match: {
        _id: toObjectId(id),
        ...byVisibility(initiator),
      },
    },
    { $unset: "__v" },
    ...withCategories(),
    ...withAuthor(),
    ...withFavorited(initiator.id),
    ...withUserRating(initiator.id),
    ...withAverageRating(),
  ];
}
