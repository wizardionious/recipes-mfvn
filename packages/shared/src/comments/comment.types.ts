import type { z } from "zod";
import type {
  commentForRecipeSchema,
  commentQuerySchema,
  commentSchema,
  createCommentSchema,
} from "./comment.schema.js";

export type CreateCommentBody = z.infer<typeof createCommentSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type CommentForRecipe = z.infer<typeof commentForRecipeSchema>;

export type CommentQuery = z.infer<typeof commentQuerySchema>;
