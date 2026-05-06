import { describe, expect, it } from "vitest";
import { createDbReview, createDbUser } from "@/__tests__/db-factories.js";
import { ReviewModel } from "./review.model.js";
import { ReviewRepository } from "./review.repository.js";

describe("ReviewRepository", () => {
  const repository = new ReviewRepository(ReviewModel);

  describe("findFeatured", () => {
    it("should return featured reviews with populated authors", async () => {
      const user1 = await createDbUser({ name: "Alice" });
      const user2 = await createDbUser({ name: "Bob" });
      const user3 = await createDbUser({ name: "Charlie" });

      await createDbReview({
        author: user1._id,
        text: "Great!",
        rating: 5,
        isFeatured: true,
      });
      await createDbReview({
        author: user2._id,
        text: "Good",
        rating: 4,
        isFeatured: true,
      });
      await createDbReview({
        author: user3._id,
        text: "Bad",
        rating: 2,
        isFeatured: false,
      });

      const result = await repository.findFeatured(2);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.text)).toEqual(
        expect.arrayContaining(["Great!", "Good"]),
      );
      expect(result.map((r) => r.author.name)).toEqual(
        expect.arrayContaining(["Alice", "Bob"]),
      );
    });

    it("should return empty array when no featured reviews", async () => {
      const user = await createDbUser();
      await createDbReview({ author: user._id, isFeatured: false });

      const result = await repository.findFeatured(5);

      expect(result).toEqual([]);
    });

    it("should respect the limit", async () => {
      const user1 = await createDbUser();
      const user2 = await createDbUser();
      const user3 = await createDbUser();

      await createDbReview({ author: user1._id, isFeatured: true });
      await createDbReview({ author: user2._id, isFeatured: true });
      await createDbReview({ author: user3._id, isFeatured: true });

      const result = await repository.findFeatured(2);

      expect(result).toHaveLength(2);
    });
  });

  describe("findAll", () => {
    it("should return paginated reviews", async () => {
      const user1 = await createDbUser();
      const user2 = await createDbUser();

      await createDbReview({ author: user1._id, text: "First", rating: 5 });
      await createDbReview({ author: user2._id, text: "Second", rating: 4 });

      const [reviews, total] = await repository.findAll({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(reviews).toHaveLength(2);
      expect(total).toBe(2);
      expect(reviews[0]?.author.name).toBeDefined();
    });

    it("should filter by isFeatured", async () => {
      const user1 = await createDbUser();
      const user2 = await createDbUser();

      await createDbReview({ author: user1._id, isFeatured: true });
      await createDbReview({ author: user2._id, isFeatured: false });

      const [reviews, total] = await repository.findAll({
        query: { page: 1, limit: 10, sort: "-createdAt", isFeatured: true },
        initiator: { id: undefined, role: undefined },
      });

      expect(reviews).toHaveLength(1);
      expect(total).toBe(1);
      expect(reviews[0]?.isFeatured).toBe(true);
    });

    it("should paginate correctly", async () => {
      const user1 = await createDbUser();
      const user2 = await createDbUser();

      await createDbReview({ author: user1._id, text: "First" });
      await createDbReview({ author: user2._id, text: "Second" });

      const [reviews, total] = await repository.findAll({
        query: { page: 2, limit: 1, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(reviews).toHaveLength(1);
      expect(total).toBe(2);
    });
  });

  describe("aggregateStats", () => {
    it("should calculate correct statistics", async () => {
      const user1 = await createDbUser();
      const user2 = await createDbUser();
      const user3 = await createDbUser();
      const user4 = await createDbUser();

      await createDbReview({ author: user1._id, rating: 5 });
      await createDbReview({ author: user2._id, rating: 4 });
      await createDbReview({ author: user3._id, rating: 3 });
      await createDbReview({ author: user4._id, rating: 2 });

      const result = await repository.aggregateStats();

      expect(result.totalReviews).toBe(4);
      expect(result.averageRating).toBe(3.5);
      expect(result.happyCooksCount).toBe(2);
    });

    it("should return zeros when no reviews exist", async () => {
      const result = await repository.aggregateStats();

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.happyCooksCount).toBe(0);
    });
  });

  describe("default populate", () => {
    it("should populate author through inherited findById", async () => {
      const user = await createDbUser({ name: "Dave" });
      const review = await createDbReview({ author: user._id, text: "Nice" });

      const result = await repository.findById(review._id.toString());

      expect(result).not.toBeNull();
      expect(result?.author.name).toBe("Dave");
    });
  });
});
