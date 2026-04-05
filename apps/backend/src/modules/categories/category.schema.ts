import { z } from "zod";
import { idParamSchema } from "@/common/schemas.js";

export { type CreateCategoryBody, createCategorySchema } from "@recipes/shared";

export const categoryParamsSchema = z.object({
  id: idParamSchema,
});
