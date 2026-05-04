import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query.js";
import { userSummarySchema } from "../users/user.schema.js";

export const createReviewSchema = z.object({
  text: z.string().trim().min(2).max(500),
  rating: z.number().int().min(1).max(5),
});

export const reviewSchema = createReviewSchema.extend({
  id: z.string(),
  author: userSummarySchema,
  isFeatured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reviewQuerySchema = z
  .object({
    sort: createSortSchema(["createdAt", "rating"]).default("-createdAt"),
    isFeatured: z.coerce.boolean().optional(),
  })
  .extend(paginationQuerySchema.shape);

export const reviewParamsSchema = z.object({
  id: z.string().length(24),
});

export const reviewStatsSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  happyCooksCount: z.number().int().nonnegative(),
});
