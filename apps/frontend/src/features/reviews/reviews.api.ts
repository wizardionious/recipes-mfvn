import type { Review, ReviewStats } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

/**
 * Get featured testimonials for the home page.
 *
 * @returns List of featured reviews.
 */
export function getTestimonials() {
  return apiClient<Review[]>("/api/reviews/testimonials");
}

/**
 * Get review statistics for social proof.
 *
 * @returns Review stats (total, average rating, happy cooks).
 */
export function getReviewStats() {
  return apiClient<ReviewStats>("/api/reviews/stats");
}
