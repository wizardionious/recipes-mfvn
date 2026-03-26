import { z } from "zod";

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
