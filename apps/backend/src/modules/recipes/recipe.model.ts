import type { Difficulty, Minutes, Replace } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema, Types } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import type { CategoryDocument } from "@/modules/categories/index.js";
import { CATEGORY_MODEL_NAME } from "@/modules/categories/index.js";
import type { SearchRecipeQuery } from "@/modules/recipes/index.js";
import type { UserDocument } from "@/modules/users/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";
import {
  byVisibility,
  withAuthor,
  withCategories,
  withFavorited,
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
}

export interface RecipeModelType extends Model<RecipeDocument> {
  searchFull(
    query: SearchRecipeQuery,
    userId?: string,
  ): Promise<[RecipeDocumentPopulated[], number] | [null, 0]>;
  findByIdFull(
    id: string,
    userId?: string,
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
      ref: CATEGORY_MODEL_NAME,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
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

recipeSchema.statics.searchFull = async function (
  query: SearchRecipeQuery,
  userId?: string,
) {
  const { page, limit, sort, isFavorited, search, categoryId, difficulty } =
    query;

  const recipes = await this.aggregate<
    WithTotalCountResult<RecipeDocumentPopulated>
  >([
    {
      $match: {
        ...byVisibility(userId),
        ...(search && { $text: { $search: search } }),
        ...(categoryId && { category: categoryId }),
        ...(difficulty && { difficulty }),
      },
    },
    { $unset: "__v" },

    ...withFavorited(userId),
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
  userId?: string,
) {
  const recipes = await this.aggregate<RecipeDocumentPopulated>([
    {
      $match: {
        _id: Types.ObjectId.createFromHexString(id),
        ...byVisibility(userId),
      },
    },
    { $unset: "__v" },
    ...withCategories(),
    ...withAuthor(),
    ...withFavorited(userId),
  ]);

  if (!recipes.length) {
    return null;
  }

  return recipes[0];
};

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RECIPE_MODEL_NAME = "Recipe";
export const RecipeModel = model<RecipeDocument, RecipeModelType>(
  RECIPE_MODEL_NAME,
  recipeSchema,
);
