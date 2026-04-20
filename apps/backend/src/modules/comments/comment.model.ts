import type { Replace } from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

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

export type CommentModelType = Model<CommentDocument>;

const commentSchema = new Schema<CommentDocument>(
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

commentSchema.index({ recipe: 1, createdAt: -1 });

export const CommentModel = model<CommentDocument, CommentModelType>(
  "Comment",
  commentSchema,
);

export const commentsCollectionName = CommentModel.collection.name;
