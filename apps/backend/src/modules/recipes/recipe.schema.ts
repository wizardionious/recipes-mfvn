import { z } from "zod";
import { idParamSchema } from "@/common/schemas.js";

export const recipeParamsSchema = z.object({
  id: idParamSchema,
});
