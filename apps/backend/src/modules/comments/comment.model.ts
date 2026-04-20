import type { Replace } from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { QueryMethodParams } from "@/common/types/methods.js";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import { withAuthor } from "@/modules/recipes/recipe.aggregation.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";
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
type FindFullFilter = FindFullByAuthor | FindFullByRecipe;

export interface CommentModelType extends Model<CommentDocument> {
  findFull(
    filter: FindFullFilter,
    params: QueryMethodParams,
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
      ref: "Recipe",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.statics.findFull = async function (
  filter: FindFullFilter,
  { query, initiator }: QueryMethodParams,
) {
  const comments = await this.aggregate<
    WithTotalCountResult<CommentDocumentPopulated>
  >([
    {
      $match: {
        ...(filter.by === "recipe"
          ? { recipe: toObjectId(filter.recipeId) }
          : { author: toObjectId(filter.authorId) }),
      },
    },
    { $unset: "__v" },
    ...withAuthor(),
    ...withRecipe(initiator),
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

export const CommentModel = model<CommentDocument, CommentModelType>(
  "Comment",
  commentSchema,
);

export const commentsCollectionName = CommentModel.collection.name;
