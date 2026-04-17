import type {
  Difficulty,
  Minutes,
  RecipeQuery,
  Replace,
} from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type {
  InitiatedMethodParams,
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { CategoryDocument } from "@/modules/categories/index.js";
import type { UserDocument } from "@/modules/users/index.js";
import {
  byVisibility,
  withAuthor,
  withAverageRating,
  withCategories,
  withFavorited,
  withUserRating,
} from "./recipe.aggregation.js";

export interface IngredientDocument {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDocument extends BaseDocument {
  title: string;
  description: string;
  ingredients: IngredientDocument[];
  instructions: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  difficulty: Difficulty;
  cookingTime: Minutes;
  servings: number;
  isPublic: boolean;
}

export interface RecipeDocumentPopulated
  extends Replace<
    RecipeDocument,
    {
      category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  > {
  isFavorited: boolean;
  userRating: number | null;
  averageRating: number | null;
  ratingCount: number;
}

export interface RecipeModelType extends Model<RecipeDocument> {
  searchFull(
    params: QueryMethodParams<RecipeQuery>,
  ): Promise<[RecipeDocumentPopulated[], number] | [null, 0]>;
  findByIdFull(
    id: string,
    params: InitiatedMethodParams<OptionalInitiator>,
  ): Promise<RecipeDocumentPopulated | null>;
}

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema<RecipeDocument, RecipeModelType>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: {
        validator: (v: IngredientDocument[]) => v.length > 0,
        message: "At least one ingredient required",
      },
    },
    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one instruction required",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    cookingTime: { type: Number, required: true, min: 1 },
    servings: { type: Number, required: true, min: 1 },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

recipeSchema.statics.searchFull = async function ({
  query,
  initiator,
}: QueryMethodParams<RecipeQuery>) {
  const { page, limit, sort, isFavorited, search, categoryId, difficulty } =
    query;

  const recipes = await this.aggregate<
    WithTotalCountResult<RecipeDocumentPopulated>
  >([
    {
      $match: {
        ...byVisibility(initiator),
        ...(search && { $text: { $search: search } }),
        ...(categoryId && { category: categoryId }),
        ...(difficulty && { difficulty }),
      },
    },
    { $unset: "__v" },

    ...withFavorited(initiator.id),
    ...withUserRating(initiator.id),
    ...withAverageRating(),
    {
      $match: {
        ...(isFavorited !== undefined && { isFavorited }),
      },
    },

    ...withTotalCount(
      ...withSort(sort),
      ...withPagination(page, limit),
      ...withCategories(),
      ...withAuthor(),
    ),
  ]);

  if (!recipes.length || !recipes[0]?.items.length) {
    return [[], recipes[0]?.total ?? 0];
  }

  return [recipes[0].items, recipes[0].total];
};

recipeSchema.statics.findByIdFull = async function (
  id: string,
  { initiator }: InitiatedMethodParams<OptionalInitiator>,
) {
  const recipes = await this.aggregate<RecipeDocumentPopulated>([
    {
      $match: {
        _id: toObjectId(id),
        ...byVisibility(initiator),
      },
    },
    { $unset: "__v" },
    ...withCategories(),
    ...withAuthor(),
    ...withFavorited(initiator.id),
    ...withUserRating(initiator.id),
    ...withAverageRating(),
  ]);

  if (!recipes.length) {
    return null;
  }

  return recipes[0];
};

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RecipeModel = model<RecipeDocument, RecipeModelType>(
  "Recipe",
  recipeSchema,
);

export const recipesCollectionName = RecipeModel.collection.name;
