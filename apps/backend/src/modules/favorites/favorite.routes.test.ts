import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { favoriteRoutes } from "@/modules/favorites/favorite.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("favoriteRoutes", () => {
  const mockFavoriteService = {
    isFavorited: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    findByUser: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const recipeId = "507f1f77bcf86cd799439033";

  const testJwtPayload = {
    userId,
    email: "user@test.com",
    role: "user",
  } as const;

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = createTestApp();
    await app.register(favoriteRoutes, {
      service: mockFavoriteService,
      prefix: "/api/recipes",
    });
  });

  describe("GET /api/recipes/:id/favorite", () => {
    it("should return favorited status when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockFavoriteService.isFavorited.mockResolvedValue(true);

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}/favorite`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.favorited).toBe(true);
      expect(mockFavoriteService.isFavorited).toHaveBeenCalledWith(recipeId, {
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}/favorite`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid recipe id", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "GET",
        url: "/api/recipes/bad-id/favorite",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/recipes/:id/favorite", () => {
    it("should add favorite when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockFavoriteService.add.mockResolvedValue({ favorited: true });

      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/favorite`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.favorited).toBe(true);
      expect(mockFavoriteService.add).toHaveBeenCalledWith(recipeId, {
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/favorite`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/recipes/:id/favorite", () => {
    it("should remove favorite when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockFavoriteService.remove.mockResolvedValue({ favorited: false });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}/favorite`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.favorited).toBe(false);
      expect(mockFavoriteService.remove).toHaveBeenCalledWith(recipeId, {
        initiator: { id: testJwtPayload.userId, role: testJwtPayload.role },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}/favorite`,
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
