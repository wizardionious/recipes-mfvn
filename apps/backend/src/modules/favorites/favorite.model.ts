import type { Replace } from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { QueryMethodParams } from "@/common/types/methods.js";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { RecipeDocumentPopulated } from "@/modules/recipes/index.js";
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
    params: QueryMethodParams,
  ): Promise<[FavoriteDocumentPopulated[], number] | [null, 0]>;
}

const favoriteSchema = new Schema<FavoriteDocument, FavoriteModelType>(
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

favoriteSchema.statics.findByUser = async function (
  userId: string,
  { query, initiator }: QueryMethodParams,
) {
  const recipes = await this.aggregate<
    WithTotalCountResult<FavoriteDocumentPopulated>
  >([
    {
      $match: {
        user: toObjectId(userId),
      },
    },
    { $unset: ["__v", "user"] },
    ...withRecipe(initiator),
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

export const FavoriteModel = model<FavoriteDocument, FavoriteModelType>(
  "Favorite",
  favoriteSchema,
);

export const favoritesCollectionName = FavoriteModel.collection.name;
