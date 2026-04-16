import z from "zod";
import { idParamSchema } from "@/common/schemas.js";

export const favoriteParamsSchema = z.object({
  recipeId: idParamSchema,
});
