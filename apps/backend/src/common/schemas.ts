import { z } from "zod";

export const idParamSchema = z.string().trim().length(24);
export type IdParam = z.infer<typeof idParamSchema>;
