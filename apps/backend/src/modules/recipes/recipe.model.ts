import type {
  Difficulty,
  Image,
  Minutes,
  Replace,
  RequireKeys,
} from "@recipes/shared";
import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

export interface IngredientDocument {
  name: string;
  quantity: number;
  unit: string;
}

export type RecipeImage = RequireKeys<Image, "url">;

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
  image: RecipeImage;
}

export interface RecipeDocumentPopulated
  extends Replace<
    RecipeDocument,
    {
      category: Pick<CategoryDocument, "_id" | "name" | "slug" | "image">;
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  > {}

export type RecipeModelType = Model<RecipeDocument>;

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const imageSchema = new Schema<RecipeImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, trim: true, required: false },
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
    image: { type: imageSchema, required: true },
  },
  {
    timestamps: true,
  },
);

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RecipeModel = model<RecipeDocument, RecipeModelType>(
  "Recipe",
  recipeSchema,
);

export const recipesCollectionName = RecipeModel.collection.name;
