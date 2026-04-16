import type { z } from "zod";
import type {
  categoryQuerySchema,
  categorySchema,
  categorySummarySchema,
  createCategorySchema,
} from "./category.schema.js";

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

export type Category = z.infer<typeof categorySchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
