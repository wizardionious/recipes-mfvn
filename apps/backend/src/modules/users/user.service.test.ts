import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createUserDoc,
  queryParams,
} from "@/__tests__/helpers.js";
import { NotFoundError } from "@/common/errors.js";
import { createUserService } from "@/modules/users/user.service.js";

describe("userService", () => {
  const mockUserRepository = {
    findById: vi.fn(),
  };
  const mockCommentService = {
    findByAuthor: vi.fn(),
    findByRecipe: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const mockFavoriteService = {
    findByUser: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    isFavorited: vi.fn(),
  };
  const service = createUserService(
    mockUserRepository,
    mockCommentService,
    mockFavoriteService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return user by ID", async () => {
      const doc = createUserDoc({ email: "user@test.com", name: "Test" });
      mockUserRepository.findById.mockReturnValue(doc);

      const result = await service.getCurrentUser(createObjectId().toString());

      expect(result.email).toBe("user@test.com");
      expect(result.name).toBe("Test");
      expect(result).not.toHaveProperty("password");
    });

    it("should throw NotFoundError when user not found", async () => {
      mockUserRepository.findById.mockReturnValue(null);

      await expect(
        service.getCurrentUser(createObjectId().toString()),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getFavorites", () => {
    it("should delegate to favoriteService.findByUser", async () => {
      const expected = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockFavoriteService.findByUser.mockResolvedValue(expected);

      const result = await service.getFavorites(
        createObjectId().toString(),
        queryParams(),
      );

      expect(mockFavoriteService.findByUser).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe("getComments", () => {
    it("should delegate to commentService.findByAuthor", async () => {
      const expected = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockCommentService.findByAuthor.mockResolvedValue(expected);

      const result = await service.getComments(
        createObjectId().toString(),
        queryParams(),
      );

      expect(mockCommentService.findByAuthor).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });
});
