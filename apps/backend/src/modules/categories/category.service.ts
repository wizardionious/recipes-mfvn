import type { Category } from "@recipes/shared";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
} from "@/common/types/methods.js";
import { toCategory } from "@/common/utils/mongo.js";
import type {
  CategoryModelType,
  CreateCategoryBody,
} from "@/modules/categories/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";

export interface CategoryService {
  findAll(): Promise<Category[]>;
  create(params: CreateMethodParams<CreateCategoryBody>): Promise<Category>;
  deleteById(categoryId: string, params: DeleteMethodParams): Promise<void>;
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
    create: async ({ data }) => {
      const category = await categoryModel.create(data);
      return toCategory(category.toObject());
    },
    deleteById: async (categoryId) => {
      const recipeCount = await recipeModel.countDocuments({
        category: categoryId,
      });
      if (recipeCount > 0) {
        throw new ConflictError("Cannot delete category with existing recipes");
      }

      const result = await categoryModel.findByIdAndDelete(categoryId);
      if (!result) {
        throw new NotFoundError("Category not found");
      }
    },
  };
}
