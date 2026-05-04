import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockReviewRepository,
  createMockUserRepository,
  createObjectId,
  createReviewDoc,
  initiator,
} from "@/__tests__/helpers.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import type { ReviewRepository } from "@/modules/reviews/review.repository.js";
import { createReviewService } from "@/modules/reviews/review.service.js";
import type { UserRepository } from "@/modules/users/user.repository.js";

describe("reviewService", () => {
  const reviewRepository = createMockReviewRepository();
  const userRepository = createMockUserRepository();

  const service = createReviewService(
    reviewRepository as unknown as ReviewRepository,
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("create", () => {
    it("should create a review when user has none", async () => {
      userRepository.exists.mockResolvedValue(true);
      reviewRepository.findOne.mockResolvedValue(null);

      const authorId = createObjectId();
      const populatedReview = {
        ...createReviewDoc({ author: authorId, text: "Love it!", rating: 5 }),
        author: { _id: authorId, name: "Alice", email: "alice@test.com" },
      };
      reviewRepository.create.mockResolvedValue(populatedReview);

      const init = initiator(authorId.toString());
      const result = await service.create({
        data: { text: "Love it!", rating: 5 },
        initiator: init,
      });

      expect(reviewRepository.create).toHaveBeenCalledWith({
        author: init.id,
        text: "Love it!",
        rating: 5,
      });
      expect(result.text).toBe("Love it!");
      expect(result.rating).toBe(5);
    });

    it("should throw ConflictError when user already has a review", async () => {
      userRepository.exists.mockResolvedValue(true);
      reviewRepository.findOne.mockResolvedValue(createReviewDoc());

      await expect(
        service.create({
          data: { text: "Another one", rating: 4 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.create({
          data: { text: "Hi", rating: 3 },
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      userRepository.exists.mockResolvedValue(false);

      await expect(
        service.create({
          data: { text: "Hi", rating: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findFeatured", () => {
    it("should return featured reviews", async () => {
      const authorId = createObjectId();
      const reviews = [
        {
          ...createReviewDoc({ author: authorId }),
          author: { _id: authorId, name: "Bob", email: "bob@test.com" },
        },
      ];
      reviewRepository.findFeatured.mockResolvedValue(reviews);

      const result = await service.findFeatured();

      expect(reviewRepository.findFeatured).toHaveBeenCalledWith(6);
      expect(result).toHaveLength(1);
      expect(result[0]?.author.name).toBe("Bob");
    });

    it("should return empty array when no featured reviews", async () => {
      reviewRepository.findFeatured.mockResolvedValue([]);

      const result = await service.findFeatured();

      expect(result).toEqual([]);
    });
  });

  describe("findAll", () => {
    it("should return paginated reviews", async () => {
      const authorId = createObjectId();
      const review = {
        ...createReviewDoc({ author: authorId }),
        author: { _id: authorId, name: "Carol", email: "carol@test.com" },
      };
      reviewRepository.findAll.mockResolvedValue([[review], 1]);

      const result = await service.findAll({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: initiator(),
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("update", () => {
    it("should update own review", async () => {
      const authorId = createObjectId();
      const review = createReviewDoc({ author: authorId });
      reviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        text: "Updated text",
        author: { _id: authorId, name: "Dave", email: "dave@test.com" },
      };
      reviewRepository.save.mockResolvedValue(updated);

      const result = await service.update(review._id.toString(), {
        data: { text: "Updated text" },
        initiator: initiator(authorId.toString()),
      });

      expect(reviewRepository.save).toHaveBeenCalledWith(review, {
        text: "Updated text",
      });
      expect(result.text).toBe("Updated text");
    });

    it("should allow admin to update any review", async () => {
      const review = createReviewDoc();
      reviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        text: "Admin update",
        author: { _id: review.author, name: "Eve", email: "eve@test.com" },
      };
      reviewRepository.save.mockResolvedValue(updated);

      const result = await service.update(review._id.toString(), {
        data: { text: "Admin update" },
        initiator: initiator(createObjectId().toString(), "admin"),
      });

      expect(result.text).toBe("Admin update");
    });

    it("should throw BadRequestError for invalid review ID", async () => {
      await expect(
        service.update("invalid-id", {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when review not found", async () => {
      reviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.update(createObjectId().toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const review = createReviewDoc();
      reviewRepository.findDocumentById.mockResolvedValue(review);

      await expect(
        service.update(review._id.toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("feature", () => {
    it("should feature a review when admin", async () => {
      const review = createReviewDoc();
      reviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        isFeatured: true,
        author: { _id: review.author, name: "Frank", email: "frank@test.com" },
      };
      reviewRepository.save.mockResolvedValue(updated);

      const result = await service.feature(
        review._id.toString(),
        { initiator: initiator(createObjectId().toString(), "admin") },
        true,
      );

      expect(reviewRepository.save).toHaveBeenCalledWith(review, {
        isFeatured: true,
      });
      expect(result.isFeatured).toBe(true);
    });

    it("should throw ForbiddenError when not admin", async () => {
      await expect(
        service.feature(
          createObjectId().toString(),
          { initiator: initiator() },
          true,
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when review not found", async () => {
      reviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.feature(
          createObjectId().toString(),
          { initiator: initiator(createObjectId().toString(), "admin") },
          true,
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete own review", async () => {
      const authorId = createObjectId();
      const review = createReviewDoc({ author: authorId });
      reviewRepository.findDocumentById.mockResolvedValue(review);

      await service.delete(review._id.toString(), {
        initiator: initiator(authorId.toString()),
      });

      expect(reviewRepository.deleteDocument).toHaveBeenCalledWith(review);
    });

    it("should allow admin to delete any review", async () => {
      const review = createReviewDoc();
      reviewRepository.findDocumentById.mockResolvedValue(review);

      await service.delete(review._id.toString(), {
        initiator: initiator(createObjectId().toString(), "admin"),
      });

      expect(reviewRepository.deleteDocument).toHaveBeenCalledWith(review);
    });

    it("should throw BadRequestError for invalid review ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when review not found", async () => {
      reviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const review = createReviewDoc();
      reviewRepository.findDocumentById.mockResolvedValue(review);

      await expect(
        service.delete(review._id.toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getStats", () => {
    it("should return review statistics", async () => {
      const stats = {
        totalReviews: 42,
        averageRating: 4.5,
        happyCooksCount: 38,
      };
      reviewRepository.aggregateStats.mockResolvedValue(stats);

      const result = await service.getStats();

      expect(result).toEqual(stats);
    });
  });
});
