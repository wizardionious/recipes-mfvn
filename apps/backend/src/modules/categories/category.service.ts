import type { Category } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import { toCategory } from "@/common/utils/mongo.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import type { CreateCategoryBody } from "@/modules/categories/category.schema.js";

export class CategoryService {
  async findAll(): Promise<Category[]> {
    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    return categories.map(toCategory);
  }

  async create(data: CreateCategoryBody): Promise<Category> {
    const category = await CategoryModel.create(data);
    return toCategory(category.toObject());
  }

  async deleteById(id: string): Promise<void> {
    const result = await CategoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError("Category not found", 404);
    }
  }
}
