import type { Comment, CreateCommentBody, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { ForbiddenError, NotFoundError } from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toComment } from "@/common/utils/mongo.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import type { CommentRepository } from "./comment.repository.js";

export interface CommentService {
  findByRecipe(
    recipeId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<Comment>>;
  findByAuthor(
    authorId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<Comment>>;
  create(
    recipeId: string,
    params: CreateMethodParams<CreateCommentBody>,
  ): Promise<Comment>;
  delete(commentId: string, params: DeleteMethodParams): Promise<void>;
}

type CommentRepositoryPort = Pick<
  CommentRepository,
  "findByRecipe" | "findByAuthor" | "findById" | "create" | "delete"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "exists" | "modelName">;
type UserRepositoryPort = Pick<UserRepository, "exists" | "modelName">;

export function createCommentService(
  repository: CommentRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  userRepository: UserRepositoryPort,
): CommentService {
  return {
    findByRecipe: async (recipeId, { query, initiator }) => {
      assertValidId(recipeId, "Recipe");
      await assertExists(recipeRepository, recipeId);

      const [comments, total] = await repository.findByRecipe(recipeId, {
        query,
        initiator,
      });

      return withPagination(
        comments.map((item) => toComment(item)),
        total,
        query.page,
        query.limit,
      );
    },

    findByAuthor: async (authorId, { query, initiator }) => {
      assertValidId(authorId, "Author");
      await assertExists(userRepository, authorId);

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

      await assertExists(recipeRepository, recipeId);
      await assertExists(userRepository, initiator.id);

      const comment = await repository.create({
        text: data.text,
        recipe: recipeId,
        author: initiator.id,
      });

      return toComment(comment);
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
