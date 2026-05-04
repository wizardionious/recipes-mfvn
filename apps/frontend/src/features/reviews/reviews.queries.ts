import { useQuery } from "@tanstack/vue-query";
import { getReviewStats, getTestimonials } from "./reviews.api";

const reviewKeys = {
  all: ["reviews"] as const,
  testimonials: () => [...reviewKeys.all, "testimonials"] as const,
  stats: () => [...reviewKeys.all, "stats"] as const,
};

/**
 * Get featured testimonials for the home page.
 *
 * @returns List of featured reviews.
 */
export function useTestimonials() {
  return useQuery({
    queryKey: reviewKeys.testimonials(),
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get review statistics for social proof.
 *
 * @returns Review stats.
 */
export function useReviewStats() {
  return useQuery({
    queryKey: reviewKeys.stats(),
    queryFn: getReviewStats,
    staleTime: 5 * 60 * 1000,
  });
}
