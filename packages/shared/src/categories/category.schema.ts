import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query.js";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
});

export const categorySchema = createCategorySchema
  .extend({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .required({
    slug: true,
  });

export const categoryComputedSchema = z.object({
  recipeCount: z.number().int().nonnegative(),
});

export const categorySummarySchema = categorySchema.pick({
  id: true,
  name: true,
  slug: true,
});

export const categoryQuerySchema = z
  .object({
    sort: createSortSchema(["name", "recipeCount"]).default("name"),
  })
  .extend(paginationQuerySchema.shape);
