import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
});

export const categoryParamsSchema = z.object({
  id: z.string().length(24),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
