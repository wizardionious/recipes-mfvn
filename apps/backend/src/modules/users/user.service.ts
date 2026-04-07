import type { Comment, Paginated, Recipe, User } from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import { toUser } from "@/common/utils/mongo.js";
import type { CommentQuery, CommentService } from "@/modules/comments/index.js";
import type { FavoriteQuery } from "@/modules/favorites/favorite.schema.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface UserService {
  getCurrentUser(userId: string): Promise<User>;
  getFavorites(
    userId: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>>;
  getComments(userId: string, query: CommentQuery): Promise<Paginated<Comment>>;
}

export function createUserService(
  commentService: CommentService,
  favoriteService: FavoriteService,
  userModel: UserModelType,
): UserService {
  return {
    getCurrentUser: async (userId) => {
      const user = await userModel.findById(userId).lean();
      if (!user) {
        throw new NotFoundError("User not found");
      }

      return toUser(user);
    },
    getFavorites: async (userId, query) => {
      return favoriteService.findByUser(userId, query);
    },
    getComments: async (userId, query) => {
      return commentService.findByUser(userId, query);
    },
  };
}
