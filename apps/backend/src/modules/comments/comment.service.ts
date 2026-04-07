import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import mongoose from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type {
  CommentModelType,
  CreateCommentBody,
} from "@/modules/comments/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserDocument, UserModelType } from "@/modules/users/index.js";

export interface CommentService {
  findByRecipe(
    recipeId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<CommentForRecipe>>;
  findByAuthor(
    authorId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<Comment>>;
  create(
    recipeId: string,
    params: CreateMethodParams<CreateCommentBody>,
  ): Promise<CommentForRecipe>;
  delete(commentId: string, params: DeleteMethodParams): Promise<void>;
}

export function createCommentService(
  commentModel: CommentModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): CommentService {
  return {
    findByRecipe: async (recipeId, { query, initiator }) => {
      if (!mongoose.isValidObjectId(recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }
      const { page, limit } = query;

      const [comments, total] = await commentModel.findFull(
        { by: "recipe", recipeId },
        { query, initiator },
      );
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

    findByAuthor: async (authorId, { query, initiator }) => {
      if (!mongoose.isValidObjectId(authorId)) {
        throw new BadRequestError("Invalid author ID");
      }
      const { page, limit } = query;

      const [comments, total] = await commentModel.findFull(
        { by: "author", authorId },
        { query, initiator },
      );
      if (!comments) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(comments.map(toComment), total, page, limit);
    },

    create: async (recipeId, { data, initiator }) => {
      if (!mongoose.isValidObjectId(recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      if (!mongoose.isValidObjectId(initiator)) {
        throw new BadRequestError("Invalid author ID");
      }

      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }
      const authorExists = await userModel.exists({ _id: initiator });
      if (!authorExists) {
        throw new NotFoundError("Author not found");
      }

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author: initiator,
      });
      const populated = await comment.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }>("author", "name email");

      return toCommentForRecipe(populated.toObject<typeof populated>());
    },

    delete: async (commentId, { initiator }) => {
      if (!mongoose.isValidObjectId(commentId)) {
        throw new BadRequestError("Invalid comment ID");
      }

      const comment = await commentModel.findById(commentId);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (!comment.author.equals(initiator)) {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await comment.deleteOne();
    },
  };
}
