import type { z } from "zod";
import type { Prettify } from "../utils.js";
import type {
  createRecipeSchema,
  difficultySchema,
  minutesSchema,
  recipeComputedSchema,
  recipeQuerySchema,
  recipeSchema,
  recipeSummarySchema,
  secondsSchema,
  updateRecipeSchema,
} from "./recipe.schema.js";

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;
export type RecipeComputed = z.infer<typeof recipeComputedSchema>;

export type RecipeWithComputed = Prettify<Recipe & RecipeComputed>;

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
