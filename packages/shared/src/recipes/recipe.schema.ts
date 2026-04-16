import { z } from "zod";
import { categorySummarySchema } from "../categories/category.schema.js";
import {
  createSortSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "../query.js";
import { userSummarySchema } from "../users/user.schema.js";
import { ingredientSchema } from "./ingredient.schema.js";

export const minutesSchema = z.number().int().min(1).brand<"Minutes">();
export const secondsSchema = z.number().int().min(1).brand<"Seconds">();

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const createRecipeSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(1000),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().trim().min(5)).min(1),
  category: z.string().length(24),
  difficulty: difficultySchema,
  cookingTime: minutesSchema,
  servings: z.number().int().min(1),
  isPublic: z.boolean().default(true),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const recipeSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string()),
  category: categorySummarySchema,
  author: userSummarySchema,
  difficulty: difficultySchema,
  cookingTime: z.number(),
  servings: z.number(),
  isPublic: z.boolean(),
  isFavorited: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const recipeQuerySchema = z
  .object({
    sort: createSortSchema(["-createdAt", "cookingTime"]).default("-createdAt"),
    categoryId: z.string().optional(),
    difficulty: difficultySchema.optional(),
    isFavorited: z.stringbool().optional(),
  })
  .extend(paginationQuerySchema.shape)
  .extend(searchQuerySchema.shape);

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
