import type {
  CategoryComputed,
  CategorySummary,
  CategoryWithComputed,
  Comment,
  Prettify,
  Recipe,
  RecipeComputed,
  RecipeSummary,
  RecipeWithComputed,
  Replace,
  Review,
  User,
  UserSummary,
} from "@recipes/shared";
import { Types } from "mongoose";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CommentDocument } from "@/modules/comments/comment.model.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { ReviewDocument } from "@/modules/reviews/review.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

export function toObjectId(id: string): Types.ObjectId {
  return Types.ObjectId.createFromHexString(id);
}

export function toRecipe<T extends RecipeDocument>(
  doc: Replace<
    T,
    {
      category: Pick<CategoryDocument, "_id" | "name" | "slug" | "image">;
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  > &
    Partial<Omit<RecipeComputed, "isFavorited">>,
  isFavorited: boolean,
): RecipeWithComputed {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    ingredients: doc.ingredients as Recipe["ingredients"],
    instructions: doc.instructions,
    category: {
      id: doc.category._id.toString(),
      name: doc.category.name,
      slug: doc.category.slug,
      image: doc.category.image,
    } satisfies CategorySummary,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    difficulty: doc.difficulty,
    cookingTime: doc.cookingTime,
    servings: doc.servings,
    isPublic: doc.isPublic,
    image: {
      ...doc.image,
      alt: doc.image.alt ?? doc.title,
    },
    isFavorited,
    userRating: doc.userRating ?? null,
    averageRating: doc.averageRating ?? null,
    ratingCount: doc.ratingCount ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCategory(
  doc: Prettify<CategoryDocument & Partial<CategoryComputed>>,
): CategoryWithComputed {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image: {
      ...doc.image,
      alt: doc.image.alt ?? doc.name,
    },
    recipeCount: doc.recipeCount ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toComment<T extends CommentDocument>(
  doc: Replace<
    T,
    {
      author: Pick<UserDocument, "_id" | "name" | "email">;
      recipe: Pick<RecipeDocument, "_id" | "title">;
    }
  >,
): Comment {
  return {
    id: doc._id.toString(),
    text: doc.text,
    recipe: {
      id: doc.recipe._id.toString(),
      title: doc.recipe.title,
    } satisfies RecipeSummary,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toUser(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toReview(
  doc: Replace<
    ReviewDocument,
    {
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  >,
): Review {
  return {
    id: doc._id.toString(),
    text: doc.text,
    rating: doc.rating,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
