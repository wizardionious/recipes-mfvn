import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
});

export const createRecipeSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().min(5)).min(1),
  category: z.string().length(24),
  cookingTime: z.number().int().min(1),
  servings: z.number().int().min(1),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const recipeParamsSchema = z.object({
  id: z.string().length(24),
});

export const recipeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().default("-createdAt"),
  category: z.string().length(24).optional(),
  search: z.string().optional(),
});

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;
export type SearchRecipeQuery = z.infer<typeof recipeQuerySchema>;
