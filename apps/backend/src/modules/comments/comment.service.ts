import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { QueryFilter } from "mongoose";
import { AppError } from "@/common/errors.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type { ICommentDocument } from "@/modules/comments/comment.model.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import type {
  CommentQuery,
  CreateCommentBody,
  RecipeCommentsParams,
} from "@/modules/comments/comment.schema.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { UserModel } from "@/modules/users/user.model.js";

export class CommentService {
  async findByRecipe(
    params: RecipeCommentsParams,
    query: CommentQuery,
  ): Promise<Paginated<CommentForRecipe>> {
    const { page, limit } = query;
    const { recipeId } = params;

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    const filter: QueryFilter<ICommentDocument> = { recipe: recipeId };

    const [items, total] = await Promise.all([
      CommentModel.find(filter)
        .populate("author", "name email")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommentModel.countDocuments(filter),
    ]);

    return withPagination(items.map(toCommentForRecipe), total, page, limit);
  }

  async create(
    recipeId: string,
    authorId: string,
    data: CreateCommentBody,
  ): Promise<CommentForRecipe> {
    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    const author = await UserModel.findById(authorId);
    if (!author) {
      throw new AppError("Author not found", 404);
    }

    const comment = await CommentModel.create({
      text: data.text,
      recipe: recipeId,
      author: authorId,
    });

    const populated = await comment.populate("author", "name email");
    return toCommentForRecipe(populated.toObject());
  }

  async findByUser(
    userId: string,
    query: CommentQuery,
  ): Promise<Paginated<Comment>> {
    const { page, limit } = query;

    const filter: QueryFilter<ICommentDocument> = { author: userId };

    const [items, total] = await Promise.all([
      CommentModel.find(filter)
        .populate("author", "name email")
        .populate("recipe", "title")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommentModel.countDocuments(filter),
    ]);

    return withPagination(items.map(toComment), total, page, limit);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await CommentModel.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.author.toString() !== userId) {
      throw new AppError("Not authorized to delete this comment", 403);
    }

    await comment.deleteOne();
  }
}
