import type { Category } from "@recipes/shared";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import { toCategory } from "@/common/utils/mongo.js";
import type {
  CategoryModelType,
  CreateCategoryBody,
} from "@/modules/categories/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";

export interface CategoryService {
  findAll(): Promise<Category[]>;
  create(data: CreateCategoryBody): Promise<Category>;
  deleteById(id: string): Promise<void>;
}

export function createCategoryService(
  categoryModel: CategoryModelType,
  recipeModel: RecipeModelType,
): CategoryService {
  return {
    findAll: async () => {
      const categories = await categoryModel.find().sort({ name: 1 }).lean();
      return categories.map(toCategory);
    },
    create: async (data) => {
      const category = await categoryModel.create(data);
      return toCategory(category.toObject());
    },
    deleteById: async (id) => {
      const recipeCount = await recipeModel.countDocuments({ category: id });
      if (recipeCount > 0) {
        throw new ConflictError("Cannot delete category with existing recipes");
      }

      const result = await categoryModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundError("Category not found");
      }
    },
  };
}
