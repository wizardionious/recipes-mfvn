import type { z } from "zod";
import type {
  createReviewSchema,
  reviewQuerySchema,
  reviewSchema,
  reviewStatsSchema,
  updateReviewSchema,
} from "./review.schema.js";

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
export type ReviewStats = z.infer<typeof reviewStatsSchema>;
