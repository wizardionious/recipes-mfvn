import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IFavoriteDocument extends Document {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavoriteDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const { _id, ...rest } = ret;
        return rest;
      },
    },
    toObject: { virtuals: true },
  },
);

favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const FavoriteModel = mongoose.model<IFavoriteDocument>(
  "Favorite",
  favoriteSchema,
);
