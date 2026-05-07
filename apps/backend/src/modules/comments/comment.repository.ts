import type { RequireKeys } from "@recipes/shared";
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
} from "@/modules/recipes/recipe.aggregation.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";
import type {
  CommentDocument,
  CommentDocumentPopulated,
} from "./comment.model.js";

export type CommentCreateInput = RequireKeys<
  CreateInput<CommentDocument>,
  "recipe" | "author" | "text"
>;
export type CommentUpdateInput = UpdateInput<CommentDocument>;
export type CommentDefaultPopulate = {
  author: Pick<UserDocument, "_id" | "name" | "email">;
  recipe: Pick<RecipeDocument, "_id" | "title">;
};

export class CommentRepository extends BaseRepository<
  CommentDocument,
  CommentCreateInput,
  CommentUpdateInput,
  CommentDefaultPopulate
> {
  async findByRecipe(
    recipeId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[CommentDocumentPopulated[], number]> {
    const pipeline = [
      stages.match<CommentDocument>({
        recipe: toObjectId(recipeId),
      }),
      stages.unset<CommentDocument>("__v"),
      withAuthor(),
      withRecipe(initiator),
      stages.paginated({
        sort: "-createdAt",
        page: query.page,
        limit: query.limit,
      }),
    ].flat();

    const result =
      await this.aggregate<PaginatedStageResult<CommentDocumentPopulated>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }

  async findByAuthor(
    authorId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[CommentDocumentPopulated[], number]> {
    const pipeline = [
      stages.match<CommentDocument>({
        author: toObjectId(authorId),
      }),
      stages.unset<CommentDocument>("__v"),
      withAuthor(),
      withRecipe(initiator),
      stages.paginated({
        sort: "-createdAt",
        page: query.page,
        limit: query.limit,
      }),
    ].flat();

    const result =
      await this.aggregate<PaginatedStageResult<CommentDocumentPopulated>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }

  protected override getDefaultPopulate() {
    return [
      { path: "author", select: "_id name email" },
      { path: "recipe", select: "_id title" },
    ];
  }
}

function withRecipe(initiator: OptionalInitiator) {
  return stages.lookup(
    {
      from: recipesCollectionName,
      localField: "recipe",
      foreignField: "_id",
      pipeline: [
        stages.match<RecipeDocument>({
          ...byVisibility(initiator),
        }),
        stages.project({
          _id: 1,
          title: 1,
        }),
      ],
      as: "recipe",
    },
    { required: true },
  );
}
