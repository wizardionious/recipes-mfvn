import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query.js";
import { userSummarySchema } from "../users/user.schema.js";

export const createSiteReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(2).max(1000),
});

export const siteReviewSchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(2).max(1000),
  author: userSummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const siteReviewQuerySchema = z
  .object({
    sort: createSortSchema(["createdAt", "rating"]).default("-createdAt"),
  })
  .extend(paginationQuerySchema.shape);
