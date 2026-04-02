import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentService } from "../comment.service.js";

vi.mock("@/modules/comments/comment.model.js", () => ({
  CommentModel: {
    find: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/modules/recipes/recipe.model.js", () => ({
  RecipeModel: {
    findById: vi.fn(),
  },
}));

vi.mock("@/modules/users/user.model.js", () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

const { CommentModel } = await import("@/modules/comments/comment.model.js");
const { RecipeModel } = await import("@/modules/recipes/recipe.model.js");
const { UserModel } = await import("@/modules/users/user.model.js");

describe("CommentService", () => {
  let service: CommentService;

  const mockDate = new Date("2024-06-15T10:00:00Z");
  const recipeId = "665a1b2c3d4e5f6a7b8c9d0e";
  const authorId = "665a1b2c3d4e5f6a7b8c9d0f";
  const commentId = "665a1b2c3d4e5f6a7b8c9d10";

  const mockAuthor = {
    _id: authorId,
    name: "Test User",
    email: "test@example.com",
  };

  const mockLeanComment = {
    _id: commentId,
    text: "Great recipe!",
    recipe: { _id: recipeId, title: "Test Recipe" },
    author: mockAuthor,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    service = new CommentService();
    vi.clearAllMocks();
  });

  describe("findByRecipe", () => {
    it("should return paginated comments for a recipe", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue({
        _id: recipeId,
      });

      const mockLean = vi.fn().mockResolvedValue([mockLeanComment]);
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockPopulate = vi.fn().mockReturnValue({ sort: mockSort });

      vi.mocked(CommentModel.find).mockReturnValue({
        populate: mockPopulate,
      } as never);
      vi.mocked(CommentModel.countDocuments).mockResolvedValue(1);

      const result = await service.findByRecipe(
        { recipeId },
        {
          page: 1,
          limit: 20,
        },
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: commentId,
        text: "Great recipe!",
        author: {
          id: authorId,
          name: "Test User",
          email: "test@example.com",
        },
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(CommentModel.find).toHaveBeenCalledWith({ recipe: recipeId });
    });

    it("should return correct pagination for multiple pages", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue({
        _id: recipeId,
      });

      const mockLean = vi.fn().mockResolvedValue([]);
      const mockLimit = vi.fn().mockReturnValue({ lean: mockLean });
      const mockSkip = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = vi.fn().mockReturnValue({ skip: mockSkip });
      const mockPopulate = vi.fn().mockReturnValue({ sort: mockSort });

      vi.mocked(CommentModel.find).mockReturnValue({
        populate: mockPopulate,
      } as never);
      vi.mocked(CommentModel.countDocuments).mockResolvedValue(45);

      const result = await service.findByRecipe(
        { recipeId },
        {
          page: 2,
          limit: 20,
        },
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should throw 404 when recipe not found", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue(null);

      await expect(
        service.findByRecipe(
          { recipeId: "nonexistent" },
          { page: 1, limit: 20 },
        ),
      ).rejects.toMatchObject({
        message: "Recipe not found",
        statusCode: 404,
      });
    });
  });

  describe("create", () => {
    it("should create and return a comment", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue({
        _id: recipeId,
      });

      const mockPopulate = vi.fn().mockResolvedValue({
        toObject: () => mockLeanComment,
      });

      vi.mocked(CommentModel.create).mockResolvedValue({
        populate: mockPopulate,
      } as never);

      vi.mocked(UserModel.findById).mockResolvedValue({
        _id: authorId,
      } as never);

      const result = await service.create(recipeId, authorId, {
        text: "Great recipe!",
      });

      expect(result).toEqual({
        id: commentId,
        text: "Great recipe!",
        author: {
          id: authorId,
          name: "Test User",
          email: "test@example.com",
        },
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      });
      expect(CommentModel.create).toHaveBeenCalledWith({
        text: "Great recipe!",
        recipe: recipeId,
        author: authorId,
      });
    });

    it("should throw 404 when recipe not found", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue(null);

      await expect(
        service.create("nonexistent", authorId, { text: "Hello" }),
      ).rejects.toMatchObject({
        message: "Recipe not found",
        statusCode: 404,
      });
    });
  });

  describe("delete", () => {
    it("should delete comment when user is the author", async () => {
      const mockDeleteOne = vi.fn().mockResolvedValue(undefined);

      vi.mocked(CommentModel.findById).mockResolvedValue({
        _id: commentId,
        author: { toString: () => authorId },
        deleteOne: mockDeleteOne,
      } as never);

      await service.delete(commentId, authorId);

      expect(CommentModel.findById).toHaveBeenCalledWith(commentId);
      expect(mockDeleteOne).toHaveBeenCalled();
    });

    it("should throw 404 when comment not found", async () => {
      vi.mocked(CommentModel.findById).mockResolvedValue(null);

      await expect(
        service.delete("nonexistent", authorId),
      ).rejects.toMatchObject({
        message: "Comment not found",
        statusCode: 404,
      });
    });

    it("should throw 403 when user is not the author", async () => {
      vi.mocked(CommentModel.findById).mockResolvedValue({
        _id: commentId,
        author: { toString: () => authorId },
        deleteOne: vi.fn(),
      } as never);

      await expect(
        service.delete(commentId, "other-user-id"),
      ).rejects.toMatchObject({
        message: "Not authorized to delete this comment",
        statusCode: 403,
      });
    });
  });
});
