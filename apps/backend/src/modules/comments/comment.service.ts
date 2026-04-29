import type {
  Comment,
  CommentForRecipe,
  CreateCommentBody,
  Paginated,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { ForbiddenError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserModelType } from "@/modules/users/user.model.js";
import type { CommentRepository } from "./comment.repository.js";

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
  repository: CommentRepository,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): CommentService {
  return {
    findByRecipe: async (recipeId, { query, initiator }) => {
      assertValidId(recipeId, "Recipe");
      await assertExists(recipeModel, recipeId);

      const [comments, total] = await repository.findByRecipe(recipeId, {
        query,
        initiator,
      });

      return withPagination(
        comments.map((item) => toCommentForRecipe(item)),
        total,
        query.page,
        query.limit,
      );
    },

    findByAuthor: async (authorId, { query, initiator }) => {
      assertValidId(authorId, "Author");
      await assertExists(userModel, authorId);

      const [comments, total] = await repository.findByAuthor(authorId, {
        query,
        initiator,
      });

      return withPagination(
        comments.map(toComment),
        total,
        query.page,
        query.limit,
      );
    },

    create: async (recipeId, { data, initiator }) => {
      assertValidId(recipeId, "Recipe");
      assertValidId(initiator.id, "Author");

      await assertExists(recipeModel, recipeId);
      await assertExists(userModel, initiator.id);

      const comment = await repository.create({
        text: data.text,
        recipe: recipeId,
        author: initiator.id,
      });

      return toCommentForRecipe(comment);
    },

    delete: async (id, { initiator }) => {
      assertValidId(id, "Comment");

      const comment = await repository.findById(id);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (
        !comment.author._id.equals(initiator.id) &&
        initiator.role !== "admin"
      ) {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await repository.delete(id);
    },
  };
}
