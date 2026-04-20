import type {
  Comment,
  Paginated,
  PaginationQuery,
  Recipe,
  User,
} from "@recipes/shared";
import { NotFoundError } from "@/common/errors.js";
import type {
  DefaultInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toUser } from "@/common/utils/mongo.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import type { UserModelType } from "@/modules/users/user.model.js";

export interface UserService {
  getCurrentUser(userId: string): Promise<User>;
  getFavorites(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<Recipe>>;
  getComments(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<Comment>>;
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
    getFavorites: async (userId, params) => {
      return favoriteService.findByUser(userId, params);
    },
    getComments: async (userId, params) => {
      return commentService.findByAuthor(userId, params);
    },
  };
}
