import type { Replace } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema, Types } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { FavoriteQuery } from "@/modules/favorites/index.js";
import type { RecipeDocumentPopulated } from "@/modules/recipes/index.js";
import { RECIPE_MODEL_NAME } from "@/modules/recipes/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";
import { withRecipe } from "./favorite.aggregation.js";

export interface FavoriteDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
}

export interface FavoriteDocumentPopulated
  extends Replace<
    FavoriteDocument,
    {
      recipe: RecipeDocumentPopulated;
    }
  > {}

export interface FavoriteModelType extends Model<FavoriteDocument> {
  findByUser(
    userId: string,
    query: FavoriteQuery,
  ): Promise<[FavoriteDocumentPopulated[], number] | [null, 0]>;
}

const favoriteSchema = new Schema<FavoriteDocument, FavoriteModelType>(
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

favoriteSchema.statics.findByUser = async function (
  userId: string,
  query: FavoriteQuery,
) {
  const recipes = await this.aggregate<
    WithTotalCountResult<FavoriteDocumentPopulated>
  >([
    {
      $match: {
        user: Types.ObjectId.createFromHexString(userId),
      },
    },
    { $unset: ["__v", "user"] },
    ...withRecipe(userId),
    ...withTotalCount(
      ...withSort("-createdAt"),
      ...withPagination(query.page, query.limit),
    ),
  ]);
  if (!recipes.length || !recipes[0]?.items.length) {
    return [[], recipes[0]?.total ?? 0];
  }

  return [recipes[0].items, recipes[0].total];
};

favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const FAVORITE_MODEL_NAME = "Favorite";
export const FavoriteModel = model<FavoriteDocument, FavoriteModelType>(
  FAVORITE_MODEL_NAME,
  favoriteSchema,
);
