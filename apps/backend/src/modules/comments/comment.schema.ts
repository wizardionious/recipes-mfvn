import { z } from "zod";
import { idParamSchema } from "@/common/schemas.js";

export const commentParamsSchema = z.object({
  id: idParamSchema,
});

export const recipeCommentsParamsSchema = z.object({
  recipeId: idParamSchema,
});
