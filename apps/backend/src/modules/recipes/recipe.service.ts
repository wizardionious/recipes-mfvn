import { Recipe } from "@recipes/recipe.model.js";
import type {
  CreateRecipeBody,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@recipes/recipe.schema.js";

interface PaginatedResult {
  items: Awaited<ReturnType<ReturnType<typeof Recipe.find>["lean"]>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class RecipeService {
  async findAll(query: SearchRecipeQuery): Promise<PaginatedResult> {
    const { page, limit, sort, category, search } = query;
    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .populate("author", "name email")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    return {
      items: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const recipe = await Recipe.findById(id)
      .populate("author", "name email")
      .populate("category", "name slug")
      .lean();

    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }
    return recipe;
  }

  async create(data: CreateRecipeBody, authorId: string) {
    const recipe = await Recipe.create({ ...data, author: authorId });
    return recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
  }

  async update(id: string, data: UpdateRecipeBody, userId: string) {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }

    if (recipe.author.toString() !== userId) {
      throw Object.assign(new Error("Not authorized to update this recipe"), {
        statusCode: 403,
      });
    }

    Object.assign(recipe, data);
    await recipe.save();
    return recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
  }

  async delete(id: string, userId: string): Promise<void> {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }

    if (recipe.author.toString() !== userId) {
      throw Object.assign(new Error("Not authorized to delete this recipe"), {
        statusCode: 403,
      });
    }

    await recipe.deleteOne();
  }
}
