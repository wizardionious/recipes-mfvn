import type { Replace } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema, Types } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
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
import type { CommentQuery } from "./comment.schema.js";

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

export interface CommentModelType extends Model<CommentDocument> {
  findByUser(
    userId: string,
    query: CommentQuery,
  ): Promise<[CommentDocumentPopulated[], number] | [null, 0]>;
  findByRecipe(
    params: { recipeId: string; userId?: string },
    query: CommentQuery,
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

commentSchema.statics.findByUser = async function (
  userId: string,
  query: CommentQuery,
) {
  const comments = await this.aggregate<
    WithTotalCountResult<CommentDocumentPopulated>
  >([
    {
      $match: {
        author: Types.ObjectId.createFromHexString(userId),
      },
    },
    { $unset: "__v" },
    ...withAuthor(),
    ...withRecipe(userId),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(query.page, query.limit),
    ),
  ]);
  if (!comments.length || !comments[0]?.items.length) {
    return [[], comments[0]?.total ?? 0];
  }

  return [comments[0].items, comments[0].total];
};

commentSchema.statics.findByRecipe = async function (
  params: { recipeId: string; userId?: string },
  query: CommentQuery,
) {
  const comments = await this.aggregate<
    WithTotalCountResult<CommentDocumentPopulated>
  >([
    {
      $match: {
        recipe: Types.ObjectId.createFromHexString(params.recipeId),
      },
    },
    { $unset: "__v" },
    ...withAuthor(),
    ...withRecipe(params.userId),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(query.page, query.limit),
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
