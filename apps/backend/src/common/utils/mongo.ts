import type {
  Category,
  CategorySummary,
  Comment,
  CommentForRecipe,
  Difficulty,
  Minutes,
  Recipe,
  RecipeSummary,
  User,
  UserSummary,
} from "@recipes/shared";
import type { ICategoryDocument } from "@/modules/categories/category.model.js";
import type { ICommentDocument } from "@/modules/comments/comment.model.js";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { IUserDocument } from "@/modules/users/user.model.js";

export function toRecipe<T extends IRecipeDocument>(
  doc: T,
  isFavorited: boolean,
): Recipe {
  const category = doc.category as unknown as ICategoryDocument;
  const author = doc.author as unknown as IUserDocument;

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    ingredients: doc.ingredients as Recipe["ingredients"],
    instructions: doc.instructions,
    category: {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
    } satisfies CategorySummary,
    author: {
      id: author._id.toString(),
      email: author.email,
      name: author.name,
    } satisfies UserSummary,
    difficulty: doc.difficulty as Difficulty,
    cookingTime: doc.cookingTime as Minutes,
    servings: doc.servings,
    isPublic: doc.isPublic,
    isFavorited,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCategory(doc: ICategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toComment(doc: ICommentDocument): Comment {
  const author = doc.author as unknown as IUserDocument;
  const recipe = doc.recipe as unknown as IRecipeDocument;

  return {
    id: doc._id.toString(),
    text: doc.text,
    recipe: {
      id: recipe._id.toString(),
      title: recipe.title,
    } satisfies RecipeSummary,
    author: {
      id: author._id.toString(),
      email: author.email,
      name: author.name,
    } satisfies UserSummary,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

export function toCommentForRecipe(doc: ICommentDocument): CommentForRecipe {
  const author = doc.author as unknown as IUserDocument;

  return {
    id: doc._id.toString(),
    text: doc.text,
    author: {
      id: author._id.toString(),
      email: author.email,
      name: author.name,
    } satisfies UserSummary,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

export function toUser(doc: IUserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
