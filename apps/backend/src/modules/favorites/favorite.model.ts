import type { Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";
import { RECIPE_MODEL_NAME } from "@/modules/recipes/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";

export interface FavoriteDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required: true },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: RECIPE_MODEL_NAME,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const FAVORITE_MODEL_NAME = "Favorite";
export const FavoriteModel = model<FavoriteDocument>(
  FAVORITE_MODEL_NAME,
  favoriteSchema,
);
