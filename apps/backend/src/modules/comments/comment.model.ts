import type { Replace } from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { PaginationQuery } from "@/common/schemas.js";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { RecipeDocument } from "@/modules/recipes/index.js";
import { RECIPE_MODEL_NAME, withAuthor } from "@/modules/recipes/index.js";
import type { UserDocument } from "@/modules/users/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";
import { withRecipe } from "./comment.aggregation.js";

export interface CommentDocument extends BaseDocument {
  text: string;
  recipe: Types.ObjectId;
  author: Types.ObjectId;
}

export interface CommentDocumentPopulated
  extends Replace<
    CommentDocument,
    {
      author: Pick<UserDocument, "_id" | "name" | "email">;
      recipe: Pick<RecipeDocument, "_id" | "title">;
    }
  > {}

type FindFullByAuthor = { by: "author"; authorId: string };
type FindFullByRecipe = { by: "recipe"; recipeId: string };
type FindFullParams = FindFullByAuthor | FindFullByRecipe;
type FindFullViewer = { viewerId?: string };

export interface CommentModelType extends Model<CommentDocument> {
  findFull(
    params: FindFullParams,
    viewer: FindFullViewer,
    pagination: PaginationQuery,
  ): Promise<[CommentDocumentPopulated[], number] | [null, 0]>;
}

const commentSchema = new Schema<CommentDocument, CommentModelType>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: RECIPE_MODEL_NAME,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.statics.findFull = async function (
  params: FindFullParams,
  viewer: FindFullViewer,
  pagination: PaginationQuery,
) {
  const filter =
    params.by === "recipe"
      ? { recipe: toObjectId(params.recipeId) }
      : { author: toObjectId(params.authorId) };

  const comments = await this.aggregate<
    WithTotalCountResult<CommentDocumentPopulated>
  >([
    {
      $match: {
        ...filter,
      },
    },
    { $unset: "__v" },
    ...withAuthor(),
    ...withRecipe(viewer.viewerId),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(pagination.page, pagination.limit),
    ),
  ]);
  if (!comments.length || !comments[0]?.items.length) {
    return [[], comments[0]?.total ?? 0];
  }

  return [comments[0].items, comments[0].total];
};

commentSchema.index({ recipe: 1, createdAt: -1 });

export const COMMENT_MODEL_NAME = "Comment";
export const CommentModel = model<CommentDocument, CommentModelType>(
  COMMENT_MODEL_NAME,
  commentSchema,
);
