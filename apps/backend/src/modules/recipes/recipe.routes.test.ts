import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { noInitiator } from "@/__tests__/helpers.js";
import { NotFoundError } from "@/common/errors.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("recipeRoutes", () => {
  const mockRecipeService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockCommentService = {
    findByRecipe: vi.fn(),
    findByAuthor: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const recipeId = "507f1f77bcf86cd799439033";
  const commentId = "507f1f77bcf86cd799439044";

  const validRecipe = {
    id: recipeId,
    title: "Test Recipe",
    description: "A delicious test recipe",
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients", "Bake it well"],
    category: {
      id: "507f1f77bcf86cd799439055",
      name: "Desserts",
      slug: "desserts",
    },
    author: { id: userId, email: "chef@test.com", name: "Chef" },
    difficulty: "easy" as const,
    cookingTime: 30,
    servings: 4,
    isPublic: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    isFavorited: false,
    userRating: null,
    averageRating: null,
    ratingCount: 0,
  };

  const paginatedResult = {
    items: [validRecipe],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
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
    await app.register(recipeRoutes, {
      service: mockRecipeService,
      commentService: mockCommentService,
      prefix: "/api/recipes",
    });
  });

  describe("GET /api/recipes", () => {
    it("should return paginated recipes for unauthenticated user", async () => {
      mockRecipeService.findAll.mockResolvedValue(paginatedResult);

      const page = 1;
      const limit = 10;
      const response = await app.inject({
        method: "GET",
        url: `/api/recipes?page=${page}&limit=${limit}`,
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findAll).toHaveBeenCalledWith({
        query: expect.objectContaining({ page, limit }),
        initiator: noInitiator(),
      });
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(paginatedResult.items.length);
    });

    it("should return paginated recipes for authenticated user", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockRecipeService.findAll.mockResolvedValue(paginatedResult);

      const response = await app.inject({
        method: "GET",
        url: "/api/recipes",
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findAll).toHaveBeenCalledWith({
        query: expect.any(Object),
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 400 for invalid query params", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes?page=abc",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/recipes/:id", () => {
    it("should return recipe by id", async () => {
      mockRecipeService.findById.mockResolvedValue(validRecipe);

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}`,
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findById).toHaveBeenCalledWith(recipeId, {
        initiator: noInitiator(),
      });
      const body = JSON.parse(response.payload);
      expect(body.title).toBe("Test Recipe");
    });

    it("should return 400 for invalid id", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes/invalid-id",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when recipe not found", async () => {
      mockRecipeService.findById.mockRejectedValue(
        new NotFoundError("Recipe not found"),
      );

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/recipes", () => {
    it("should create recipe when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockRecipeService.create.mockResolvedValue(validRecipe);

      const payload = {
        title: "New Recipe",
        description: "A new recipe description",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix all ingredients together"],
        category: "507f1f77bcf86cd799439055",
        difficulty: "easy",
        cookingTime: 20,
        servings: 2,
        isPublic: true,
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(201);
      expect(mockRecipeService.create).toHaveBeenCalledWith({
        data: payload,
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid body", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload: { title: "AB" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/recipes/:id", () => {
    it("should update recipe when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockRecipeService.update.mockResolvedValue({
        ...validRecipe,
        title: "Updated",
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/recipes/${recipeId}`,
        payload: { title: "Updated" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.update).toHaveBeenCalledWith(recipeId, {
        data: { title: "Updated", isPublic: true },
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/api/recipes/${recipeId}`,
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid id", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "PATCH",
        url: "/api/recipes/bad-id",
        payload: {},
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/recipes/:id", () => {
    it("should delete recipe when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockRecipeService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(204);
      expect(mockRecipeService.delete).toHaveBeenCalledWith(recipeId, {
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/recipes/:id/comments", () => {
    it("should return comments for recipe", async () => {
      mockCommentService.findByRecipe.mockResolvedValue({
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
        url: `/api/recipes/${recipeId}/comments`,
      });

      expect(response.statusCode).toBe(200);
      expect(mockCommentService.findByRecipe).toHaveBeenCalledWith(recipeId, {
        query: expect.any(Object),
        initiator: noInitiator(),
      });
    });

    it("should return 400 for invalid recipe id", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes/bad-id/comments",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/recipes/:id/comments", () => {
    it("should create comment when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockCommentService.create.mockResolvedValue({
        id: commentId,
        text: "Great!",
        recipe: { id: recipeId, title: "Test" },
        author: {
          id: testJwtPayload.userId,
          email: testJwtPayload.email,
          name: "User",
        },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/comments`,
        payload: { text: "Great!" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(201);
      expect(mockCommentService.create).toHaveBeenCalledWith(recipeId, {
        data: { text: "Great!" },
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/comments`,
        payload: { text: "Hi" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/recipes/comments/:id", () => {
    it("should delete comment when authenticated", async () => {
      verifyToken.mockReturnValue(testJwtPayload);
      mockCommentService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/comments/${commentId}`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(204);
      expect(mockCommentService.delete).toHaveBeenCalledWith(commentId, {
        initiator: {
          id: testJwtPayload.userId,
          role: testJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/comments/${commentId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
