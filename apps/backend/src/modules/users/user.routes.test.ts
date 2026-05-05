import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { userRoutes } from "@/modules/users/user.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("userRoutes", () => {
  const mockUserService = {
    getCurrentUser: vi.fn(),
    getFavorites: vi.fn(),
    getComments: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";

  const testJwtPayload = {
    userId,
    email: "user@test.com",
    role: "user",
  } as const;

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = createTestApp();
    await app.register(userRoutes, {
      service: mockUserService,
      prefix: "/api/users",
    });
  });

  describe("GET /api/users/me", () => {
    it("should return current user when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockUserService.getCurrentUser.mockResolvedValue({
        id: testJwtPayload.userId,
        email: testJwtPayload.email,
        name: "Test User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getCurrentUser).toHaveBeenCalledWith(
        testJwtPayload.userId,
      );
      const body = JSON.parse(response.payload);
      expect(body.email).toBe(testJwtPayload.email);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/users/me/favorites", () => {
    it("should return favorites when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockUserService.getFavorites.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/favorites",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getFavorites).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          query: expect.any(Object),
          initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
        }),
      );
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/favorites",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/users/me/comments", () => {
    it("should return comments when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockUserService.getComments.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/comments",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getComments).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          query: expect.any(Object),
          initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
        }),
      );
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/comments",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
