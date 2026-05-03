import type { z } from "zod";
import type { Prettify } from "../utils.js";
import type {
  categoryComputedSchema,
  categoryQuerySchema,
  categorySchema,
  categorySummarySchema,
  createCategorySchema,
} from "./category.schema.js";

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;

export type Category = z.infer<typeof categorySchema>;
export type CategoryComputed = z.infer<typeof categoryComputedSchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;

export type CategoryWithComputed = Prettify<Category & CategoryComputed>;

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
