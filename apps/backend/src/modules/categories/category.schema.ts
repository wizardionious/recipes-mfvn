import { z } from "zod";
import { idParamSchema } from "@/common/schemas.js";

export const categoryParamsSchema = z.object({
  id: idParamSchema,
});
