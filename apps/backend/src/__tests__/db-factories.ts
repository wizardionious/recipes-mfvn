import type { Minutes } from "@recipes/shared";
import type { Types } from "mongoose";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { ReviewModel } from "@/modules/reviews/review.model.js";
import { UserModel } from "@/modules/users/user.model.js";
import { createObjectId } from "./helpers.js";

let counter = 0;
function unique(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export async function createDbUser(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
    role: "user" | "admin";
  }> = {},
) {
  return UserModel.create({
    email: `${unique("user")}@test.com`,
    password: "hashedPassword123",
    name: "Test User",
    role: "user",
    ...overrides,
  });
}

export async function createDbCategory(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
  }> = {},
) {
  const name = overrides.name ?? unique("category");
  return CategoryModel.create({
    name,
    slug: overrides.slug ?? name.toLowerCase().replace(/\s+/g, "-"),
    description: "A test category",
    ...overrides,
  });
}

export async function createDbRecipe(
  overrides: Partial<{
    title: string;
    description: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    instructions: string[];
    category: Types.ObjectId;
    author: Types.ObjectId;
    difficulty: "easy" | "medium" | "hard";
    cookingTime: Minutes;
    servings: number;
    isPublic: boolean;
    image: { url: string; alt?: string };
  }> = {},
) {
  return RecipeModel.create({
    title: unique("recipe"),
    description: "A test recipe",
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients"],
    category: createObjectId(),
    author: createObjectId(),
    difficulty: "easy",
    cookingTime: 30 as Minutes,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    },
    ...overrides,
  });
}

export async function createDbComment(
  overrides: Partial<{
    text: string;
    recipe: Types.ObjectId;
    author: Types.ObjectId;
  }> = {},
) {
  return CommentModel.create({
    text: "Great recipe!",
    recipe: createObjectId(),
    author: createObjectId(),
    ...overrides,
  });
}

export async function createDbFavorite(
  overrides: Partial<{
    user: Types.ObjectId;
    recipe: Types.ObjectId;
  }> = {},
) {
  return FavoriteModel.create({
    user: createObjectId(),
    recipe: createObjectId(),
    ...overrides,
  });
}

export async function createDbRecipeRating(
  overrides: Partial<{
    user: Types.ObjectId;
    recipe: Types.ObjectId;
    value: number;
  }> = {},
) {
  return RecipeRatingModel.create({
    user: createObjectId(),
    recipe: createObjectId(),
    value: 5,
    ...overrides,
  });
}

export async function createDbReview(
  overrides: Partial<{
    author: Types.ObjectId;
    text: string;
    rating: number;
    isFeatured: boolean;
  }> = {},
) {
  return ReviewModel.create({
    author: createObjectId(),
    text: "Amazing platform!",
    rating: 5,
    isFeatured: false,
    ...overrides,
  });
}
