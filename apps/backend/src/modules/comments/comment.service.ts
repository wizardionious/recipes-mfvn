import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import mongoose from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type {
  CommentModelType,
  CommentQuery,
  CreateCommentBody,
} from "@/modules/comments/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserDocument, UserModelType } from "@/modules/users/index.js";

export interface CommentService {
  findByRecipe(
    params: { recipeId: string; userId?: string },
    query: CommentQuery,
  ): Promise<Paginated<CommentForRecipe>>;
  create(
    recipeId: string,
    authorId: string,
    data: CreateCommentBody,
  ): Promise<CommentForRecipe>;
  findByUser(userId: string, query: CommentQuery): Promise<Paginated<Comment>>;
  delete(id: string, userId: string): Promise<void>;
}

export function createCommentService(
  commentModel: CommentModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): CommentService {
  return {
    findByRecipe: async (params, query) => {
      const { page, limit } = query;
      if (!mongoose.isValidObjectId(params.recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipeExists = await recipeModel.exists({ _id: params.recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }

      const [comments, total] = await commentModel.findByRecipe(params, query);
      if (!comments) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(
        comments.map((item) => toCommentForRecipe(item)),
        total,
        page,
        limit,
      );
    },

    create: async (recipeId, authorId, data) => {
      if (!mongoose.isValidObjectId(recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      if (!mongoose.isValidObjectId(authorId)) {
        throw new BadRequestError("Invalid author ID");
      }

      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }
      const authorExists = await userModel.exists({ _id: authorId });
      if (!authorExists) {
        throw new NotFoundError("Author not found");
      }

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author: authorId,
      });
      const populated = await comment.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }>("author", "name email");

      return toCommentForRecipe(populated.toObject<typeof populated>());
    },

    findByUser: async (userId, query) => {
      if (!mongoose.isValidObjectId(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const { page, limit } = query;

      const [comments, total] = await commentModel.findByUser(userId, query);
      if (!comments) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(comments.map(toComment), total, page, limit);
    },

    delete: async (id, userId) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestError("Invalid comment ID");
      }

      const comment = await commentModel.findById(id);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (!comment.author.equals(userId)) {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await comment.deleteOne();
    },
  };
}
