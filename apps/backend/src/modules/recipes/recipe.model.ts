import type { Difficulty, Minutes } from "@recipes/shared";
import type { Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { CATEGORY_MODEL_NAME } from "@/modules/categories/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";

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

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema<RecipeDocument>(
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

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RECIPE_MODEL_NAME = "Recipe";
export const RecipeModel = model<RecipeDocument>(
  RECIPE_MODEL_NAME,
  recipeSchema,
);
