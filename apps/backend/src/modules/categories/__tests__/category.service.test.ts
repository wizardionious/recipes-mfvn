import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryService } from "../category.service.js";

vi.mock("../category.model.js", () => ({
  CategoryModel: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

const { CategoryModel } = await import("../category.model.js");

describe("CategoryService", () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all categories sorted by name", async () => {
      const mockDate = new Date("2024-01-01");
      const mockCategories = [
        {
          _id: "1",
          name: "Desserts",
          slug: "desserts",
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          _id: "2",
          name: "Soups",
          slug: "soups",
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];

      vi.mocked(CategoryModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockCategories),
        }),
      } as never);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        name: "Desserts",
        slug: "desserts",
        description: undefined,
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      });
      expect(CategoryModel.find).toHaveBeenCalled();
    });

    it("should return empty array when no categories exist", async () => {
      vi.mocked(CategoryModel.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create and return a category", async () => {
      const input = { name: "Appetizers" };
      const mockDate = new Date("2024-01-01");
      const mockDoc = {
        _id: "1",
        name: "Appetizers",
        slug: "appetizers",
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      vi.mocked(CategoryModel.create).mockResolvedValue({
        ...mockDoc,
        toObject: vi.fn().mockReturnValue(mockDoc),
      } as never);

      const result = await service.create(input);

      expect(result).toEqual({
        id: "1",
        name: "Appetizers",
        slug: "appetizers",
        description: undefined,
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      });
      expect(CategoryModel.create).toHaveBeenCalledWith(input);
    });
  });

  describe("deleteById", () => {
    it("should delete category by id", async () => {
      vi.mocked(CategoryModel.findByIdAndDelete, {
        partial: true,
      }).mockResolvedValue({
        _id: "1",
      });

      await expect(service.deleteById("1")).resolves.toBeUndefined();
      expect(CategoryModel.findByIdAndDelete).toHaveBeenCalledWith("1");
    });

    it("should throw 404 error when category not found", async () => {
      vi.mocked(CategoryModel.findByIdAndDelete).mockResolvedValue(null);

      await expect(service.deleteById("999")).rejects.toMatchObject({
        message: "Category not found",
        statusCode: 404,
      });
    });
  });
});
