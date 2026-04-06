import type {
  Category,
  CategorySummary,
  Comment,
  CommentForRecipe,
  Recipe,
  RecipeSummary,
  Replace,
  User,
  UserSummary,
} from "@recipes/shared";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CommentDocument } from "@/modules/comments/comment.model.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

export function toRecipe<T extends RecipeDocument>(
  doc: Replace<
    T,
    {
      category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  >,
  isFavorited: boolean,
): Recipe {
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
    isFavorited,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCategory(doc: CategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
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

export function toCommentForRecipe<T extends CommentDocument>(
  doc: Omit<
    Replace<
      T,
      {
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }
    >,
    "recipe"
  >,
): CommentForRecipe {
  return {
    id: doc._id.toString(),
    text: doc.text,
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
