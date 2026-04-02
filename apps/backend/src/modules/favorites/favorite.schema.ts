import z from "zod";
import { idParamSchema, paginationQuerySchema } from "@/common/schemas.js";

export const favoriteParamsSchema = z.object({
  recipeId: idParamSchema,
});

export const favoriteQuerySchema = paginationQuerySchema;

export type FavoriteParams = z.infer<typeof favoriteParamsSchema>;
export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>;
