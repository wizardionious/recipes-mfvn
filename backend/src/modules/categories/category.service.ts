import { Category } from "./category.model.js";
import type { CreateCategoryBody } from "./category.schema.js";

export class CategoryService {
  async findAll() {
    return Category.find().sort({ name: 1 }).lean();
  }

  async create(data: CreateCategoryBody) {
    return Category.create(data);
  }

  async deleteById(id: string): Promise<void> {
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      throw Object.assign(new Error("Category not found"), {
        statusCode: 404,
      });
    }
  }
}
