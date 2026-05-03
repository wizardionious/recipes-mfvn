import type { z } from "zod";
import type {
  createIngredientSchema,
  ingredientSchema,
} from "./ingredient.schema.js";

export type CreateIngredientBody = z.infer<typeof createIngredientSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
