import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { reviewRoutes } from "@/modules/reviews/review.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("reviewRoutes", () => {
  const mockReviewService = {
    findFeatured: vi.fn(),
    getStats: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    feature: vi.fn(),
    delete: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439022";
  const reviewId = "507f1f77bcf86cd799439033";

  const validReview = {
    id: reviewId,
    text: "Great platform!",
    rating: 5,
    author: { id: userId, email: "user@test.com", name: "User" },
    isFeatured: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const testJwtPayload = {
    userId,
    email: "user@test.com",
    role: "user",
  } as const;

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = createTestApp();
    await app.register(reviewRoutes, {
      service: mockReviewService,
      prefix: "/api/reviews",
    });
  });

  describe("GET /api/reviews/testimonials", () => {
    it("should return featured testimonials", async () => {
      mockReviewService.findFeatured.mockResolvedValue([validReview]);

      const response = await app.inject({
        method: "GET",
        url: "/api/reviews/testimonials",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveLength(1);
      expect(body[0].text).toBe("Great platform!");
    });
  });

  describe("GET /api/reviews/stats", () => {
    it("should return review statistics", async () => {
      mockReviewService.getStats.mockResolvedValue({
        totalReviews: 42,
        averageRating: 4.5,
        happyCooksCount: 38,
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/reviews/stats",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.totalReviews).toBe(42);
      expect(body.averageRating).toBe(4.5);
    });
  });

  describe("POST /api/reviews", () => {
    it("should create review when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockReviewService.create.mockResolvedValue(validReview);

      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        payload: { text: "Great platform!", rating: 5 },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(201);
      expect(mockReviewService.create).toHaveBeenCalledWith({
        data: { text: "Great platform!", rating: 5 },
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        payload: { text: "Hi", rating: 3 },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid body", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        payload: { text: "Hi", rating: 10 },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/reviews", () => {
    it("should return paginated reviews when admin", async () => {
      verifyToken.mockReturnValue({
        userId: adminId,
        email: "admin@test.com",
        role: "admin",
      });
      mockReviewService.findAll.mockResolvedValue({
        items: [validReview],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/reviews",
        headers: authHeader({
          userId: adminId,
          email: "admin@test.com",
          role: "admin",
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(1);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/reviews",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "GET",
        url: "/api/reviews",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("PATCH /api/reviews/:id", () => {
    it("should update review when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockReviewService.update.mockResolvedValue({
        ...validReview,
        text: "Updated",
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/reviews/${reviewId}`,
        payload: { text: "Updated" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockReviewService.update).toHaveBeenCalledWith(reviewId, {
        data: { text: "Updated" },
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/reviews/${reviewId}`,
        payload: { text: "Updated" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid id", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "PATCH",
        url: "/api/reviews/bad-id",
        payload: { text: "Updated" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PATCH /api/reviews/:id/feature", () => {
    it("should feature review when admin", async () => {
      verifyToken.mockReturnValue({
        userId: adminId,
        email: "admin@test.com",
        role: "admin",
      });
      mockReviewService.feature.mockResolvedValue({
        ...validReview,
        isFeatured: true,
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/reviews/${reviewId}/feature`,
        payload: { isFeatured: true },
        headers: authHeader({
          userId: adminId,
          email: "admin@test.com",
          role: "admin",
        }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockReviewService.feature).toHaveBeenCalledWith(
        reviewId,
        { initiator: { id: adminId, role: "admin" } },
        true,
      );
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/reviews/${reviewId}/feature`,
        payload: { isFeatured: true },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "PATCH",
        url: `/api/reviews/${reviewId}/feature`,
        payload: { isFeatured: true },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    it("should delete review when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockReviewService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/reviews/${reviewId}`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(204);
      expect(mockReviewService.delete).toHaveBeenCalledWith(reviewId, {
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/reviews/${reviewId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid id", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "DELETE",
        url: "/api/reviews/bad-id",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
