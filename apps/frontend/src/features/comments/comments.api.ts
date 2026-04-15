import type {
  CommentForRecipe,
  CreateCommentBody,
  Paginated,
  PaginationQuery,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

/**
 * Get comments for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getRecipeComments(
  id: string,
  { page = 1, limit = 20 }: PaginationQuery,
): Promise<Paginated<CommentForRecipe>> {
  return apiClient<Paginated<CommentForRecipe>>(`/api/recipes/${id}/comments`, {
    query: { page, limit },
  });
}

/**
 * Create a new comment for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - comment data.
 * @returns Created comment.
 */
export function createRecipeComment(
  id: string,
  body: CreateCommentBody,
): Promise<CommentForRecipe> {
  return apiClient<CommentForRecipe>(`/api/recipes/${id}/comments`, {
    method: "POST",
    body,
  });
}

/**
 * Delete a comment with the given id.
 *
 * @param id - comment id.
 */
export function deleteRecipeComment(commentId: string): Promise<void> {
  return apiClient<void>(`/api/recipes/comments/${commentId}`, {
    method: "DELETE",
  });
}

/**
 * @todo Implement retriving comments for the user other than the current one.
 *
 * Get comments written by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getUserComments(
  _user: string,
  { page = 1, limit = 20 }: PaginationQuery,
): Promise<Paginated<CommentForRecipe>> {
  return apiClient<Paginated<CommentForRecipe>>("/api/users/me/comments", {
    query: { page, limit },
  });
}
