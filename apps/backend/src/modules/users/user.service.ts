import type { Comment, Paginated, Recipe, User } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import { toUser } from "@/common/utils/mongo.js";
import type { CommentQuery } from "@/modules/comments/comment.schema.js";
import { CommentService } from "@/modules/comments/comment.service.js";
import type { FavoriteQuery } from "@/modules/favorites/favorite.schema.js";
import { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { UserModel } from "@/modules/users/user.model.js";

export class UserService {
  private readonly favoriteService: FavoriteService;
  private readonly commentService: CommentService;

  constructor(
    favoriteService: FavoriteService = new FavoriteService(),
    commentService: CommentService = new CommentService(),
  ) {
    this.favoriteService = favoriteService;
    this.commentService = commentService;
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return toUser(user);
  }

  async getFavorites(
    userId: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>> {
    return this.favoriteService.findByUser(userId, query);
  }

  async getComments(
    userId: string,
    query: CommentQuery,
  ): Promise<Paginated<Comment>> {
    return this.commentService.findByUser(userId, query);
  }
}
