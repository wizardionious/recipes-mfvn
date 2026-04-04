import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
