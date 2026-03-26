import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  title: string;
  description: string;
  ingredients: IIngredient[];
  instructions: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  cookingTime: number;
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, trim: true },
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: [(v: IIngredient[]) => v.length > 0, "At least one ingredient required"],
    },
    instructions: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length > 0, "At least one instruction required"],
    },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cookingTime: { type: Number, required: true, min: 1 },
    servings: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
