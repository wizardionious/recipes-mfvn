import type { z } from "zod";
import type {
  createSiteReviewSchema,
  siteReviewQuerySchema,
  siteReviewSchema,
} from "./site-reviews.schema.js";

export type CreateSiteReviewBody = z.infer<typeof createSiteReviewSchema>;
export type SiteReview = z.infer<typeof siteReviewSchema>;
export type SiteReviewQuery = z.infer<typeof siteReviewQuerySchema>;
