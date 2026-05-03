import type { RecipeComputed, RecipeQuery, RequireKeys } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  InitiatedMethodParams,
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
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";
import {
  byVisibility,
  withAuthor,
  withAverageRating,
  withCategories,
  withFavorited,
  withUserRating,
} from "./recipe.aggregation.js";
import type {
  RecipeDocument,
  RecipeDocumentPopulated,
} from "./recipe.model.js";

export type RecipeCreateInput = RequireKeys<
  CreateInput<RecipeDocument>,
  | "title"
  | "description"
  | "ingredients"
  | "instructions"
  | "category"
  | "author"
  | "difficulty"
  | "cookingTime"
  | "servings"
  | "isPublic"
>;
export type RecipeUpdateInput = UpdateInput<Omit<RecipeDocument, "author">>;
export type RecipeDefaultPopulate = {
  author: Pick<UserDocument, "_id" | "name" | "email">;
  category: Pick<CategoryDocument, "_id" | "name" | "slug">;
};

export class RecipeRepository extends BaseRepository<
  RecipeDocument,
  RecipeCreateInput,
  RecipeUpdateInput,
  RecipeDefaultPopulate
> {
  async aggregateSearch({
    query,
    initiator,
  }: QueryMethodParams<RecipeQuery>): Promise<
    [Array<RecipeDocumentPopulated & RecipeComputed>, number]
  > {
    const result = await this.aggregate<
      WithTotalCountResult<RecipeDocumentPopulated & RecipeComputed>
    >(buildSearchPipeline({ query, initiator }));

    return extractTotalCountResult(result);
  }

  async aggregateById(
    id: string,
    { initiator }: InitiatedMethodParams<OptionalInitiator>,
  ): Promise<(RecipeDocumentPopulated & RecipeComputed) | undefined> {
    const result = await this.aggregate<
      RecipeDocumentPopulated & RecipeComputed
    >(buildFindByIdPipeline(id, { initiator }));

    return result[0];
  }

  protected override getDefaultPopulate() {
    return [
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ];
  }
}

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
