import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1),
});

export const ingredientSchema = createIngredientSchema;
