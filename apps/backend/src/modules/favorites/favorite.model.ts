import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";

export interface FavoriteDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
}

export type FavoriteModelType = Model<FavoriteDocument>;

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const FavoriteModel = model<FavoriteDocument, FavoriteModelType>(
  "Favorite",
  favoriteSchema,
);

export const favoritesCollectionName = FavoriteModel.collection.name;
