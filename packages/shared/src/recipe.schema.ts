import { z } from "zod";

export const minutesSchema = z.number().int().min(1).brand<"Minutes">();
export const secondsSchema = z.number().int().min(1).brand<"Seconds">();

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().trim().min(1),
});

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
