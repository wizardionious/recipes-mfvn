import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";

export interface RecipeRatingDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  value: number;
}

export interface RecipeRatingModelType extends Model<RecipeRatingDocument> {}

const recipeRatingSchema = new Schema<
  RecipeRatingDocument,
  RecipeRatingModelType
>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  {
    collection: "recipeRatings",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

recipeRatingSchema.index({ user: 1, recipe: 1 }, { unique: true });

export const RecipeRatingModel = model<
  RecipeRatingDocument,
  RecipeRatingModelType
>("RecipeRating", recipeRatingSchema);

export const recipeRatingsCollectionName = RecipeRatingModel.collection.name;
