import { z } from "zod";
import { idParamSchema, paginationQuerySchema } from "@/common/schemas.js";

export { type CreateCommentBody, createCommentSchema } from "@recipes/shared";

export const commentParamsSchema = z.object({
  id: idParamSchema,
});

export const recipeCommentsParamsSchema = z.object({
  recipeId: idParamSchema,
});

export const commentQuerySchema = paginationQuerySchema;

export type CommentParams = z.infer<typeof commentParamsSchema>;
export type RecipeCommentsParams = z.infer<typeof recipeCommentsParamsSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
