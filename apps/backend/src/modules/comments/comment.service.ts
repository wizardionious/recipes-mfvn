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
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { extractTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type {
  CommentDocumentPopulated,
  CommentModelType,
} from "@/modules/comments/comment.model.js";
import { buildFindPipeline } from "@/modules/comments/comment.pipeline.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type {
  UserDocument,
  UserModelType,
} from "@/modules/users/user.model.js";

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
      assertValidId(recipeId, "Recipe");
      await assertExists(recipeModel, recipeId);

      const { page, limit } = query;

      const [comments, total] = extractTotalCountResult(
        await commentModel.aggregate<
          WithTotalCountResult<CommentDocumentPopulated>
        >(buildFindPipeline({ by: "recipe", recipeId }, { query, initiator })),
      );

      return withPagination(
        comments.map((item) => toCommentForRecipe(item)),
        total,
        page,
        limit,
      );
    },

    findByAuthor: async (authorId, { query, initiator }) => {
      assertValidId(authorId, "Author");

      const { page, limit } = query;

      const [comments, total] = extractTotalCountResult(
        await commentModel.aggregate<
          WithTotalCountResult<CommentDocumentPopulated>
        >(buildFindPipeline({ by: "author", authorId }, { query, initiator })),
      );

      return withPagination(comments.map(toComment), total, page, limit);
    },

    create: async (recipeId, { data, initiator }) => {
      assertValidId(recipeId, "Recipe");
      assertValidId(initiator.id, "Author");

      await assertExists(recipeModel, recipeId);
      await assertExists(userModel, initiator.id);

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author: initiator.id,
      });
      const populated = await comment.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }>("author", "name email");

      return toCommentForRecipe(populated.toObject<typeof populated>());
    },

    delete: async (commentId, { initiator }) => {
      assertValidId(commentId, "Comment");

      const comment = await commentModel.findById(commentId);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (!comment.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await comment.deleteOne();
    },
  };
}
