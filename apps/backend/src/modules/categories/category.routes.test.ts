import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("categoryRoutes", () => {
  const mockCategoryService = {
    findAll: vi.fn(),
    create: vi.fn(),
    deleteById: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439022";
  const categoryId = "507f1f77bcf86cd799439033";

  const validCategory = {
    id: categoryId,
    name: "Desserts",
    slug: "desserts",
    description: "Sweet dishes",
    image: {
      url: "https://example.com/desserts.jpg",
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const testJwtPayload = {
    userId,
    email: "user@test.com",
    role: "user",
  } as const;

  const testAdminJwtPayload = {
    userId: adminId,
    email: "admin@test.com",
    role: "admin",
  } as const;

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = createTestApp();
    await app.register(categoryRoutes, {
      service: mockCategoryService,
      prefix: "/api/categories",
    });
  });

  describe("GET /api/categories", () => {
    it("should return paginated categories", async () => {
      mockCategoryService.findAll.mockResolvedValue({
        items: [{ ...validCategory, recipeCount: 5 }],
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
        url: "/api/categories?page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].name).toBe("Desserts");
    });

    it("should return 400 for invalid query", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/categories?page=abc",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/categories", () => {
    it("should create category when admin", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);
      mockCategoryService.create.mockResolvedValue(validCategory);

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: {
          name: "Desserts",
          image: { url: "https://example.com/desserts.jpg" },
        },
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(201);
      expect(mockCategoryService.create).toHaveBeenCalledWith({
        data: {
          name: "Desserts",
          image: { url: "https://example.com/desserts.jpg" },
        },
        initiator: {
          id: testAdminJwtPayload.userId,
          role: testAdminJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Desserts" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Desserts" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "" },
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete category when admin", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);
      mockCategoryService.deleteById.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(204);
      expect(mockCategoryService.deleteById).toHaveBeenCalledWith(categoryId, {
        initiator: {
          id: testAdminJwtPayload.userId,
          role: testAdminJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid id", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);

      const response = await app.inject({
        method: "DELETE",
        url: "/api/categories/bad-id",
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
