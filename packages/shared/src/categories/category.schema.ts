import { z } from "zod";
import { createSortSchema } from "../query.js";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  recipeCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const categorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const categoryQuerySchema = z.object({
  sort: createSortSchema(["name", "recipeCount"]).default("name"),
});
