import type {
  Comment,
  Paginated,
  PaginationQuery,
  RecipeWithComputed,
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
import type { UserRepository } from "./user.repository.js";

export interface UserService {
  getCurrentUser(userId: string): Promise<User>;
  getFavorites(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<RecipeWithComputed>>;
  getComments(
    userId: string,
    params: QueryMethodParams<PaginationQuery, DefaultInitiator>,
  ): Promise<Paginated<Comment>>;
}

type UserRepositoryPort = Pick<UserRepository, "findById">;
type CommentServicePort = Pick<CommentService, "findByAuthor">;
type FavoriteServicePort = Pick<FavoriteService, "findByUser">;

export function createUserService(
  repository: UserRepositoryPort,
  commentService: CommentServicePort,
  favoriteService: FavoriteServicePort,
): UserService {
  return {
    getCurrentUser: async (userId) => {
      const user = await repository.findById(userId);
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
