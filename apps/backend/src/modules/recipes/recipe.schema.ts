import { difficultySchema } from "@recipes/shared";
import { z } from "zod";
import {
  idParamSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "@/common/schemas.js";

export {
  type CreateRecipeBody,
  createRecipeSchema,
  type UpdateRecipeBody,
  updateRecipeSchema,
} from "@recipes/shared";

export const recipeParamsSchema = z.object({
  recipeId: idParamSchema,
});

export const recipeQuerySchema = z
  .object({
    sort: z.string().trim().default("-createdAt"),
    categoryId: idParamSchema.optional(),
    difficulty: difficultySchema.optional(),
    isFavorited: z.coerce.boolean().optional(),
  })
  .extend(paginationQuerySchema.shape)
  .extend(searchQuerySchema.shape);

export type SearchRecipeQuery = z.infer<typeof recipeQuerySchema>;
