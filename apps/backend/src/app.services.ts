import type { CacheService } from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import type { AuthService } from "@/modules/auth/auth.service.js";
import { createAuthService } from "@/modules/auth/auth.service.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { CategoryRepository } from "@/modules/categories/category.repository.js";
import type { CategoryService } from "@/modules/categories/category.service.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { CommentRepository } from "@/modules/comments/comment.repository.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import { createCommentService } from "@/modules/comments/comment.service.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { FavoriteRepository } from "@/modules/favorites/favorite.repository.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { RecipeRatingRepository } from "@/modules/recipe-ratings/recipe-rating.repository.js";
import type { RecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import { createRecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import type { RecipeService } from "@/modules/recipes/recipe.service.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";
import { UserModel } from "@/modules/users/user.model.js";
import type { UserService } from "@/modules/users/user.service.js";
import { createUserService } from "@/modules/users/user.service.js";

export interface Services {
  auth: AuthService;
  user: UserService;
  recipe: RecipeService;
  comment: CommentService;
  favorite: FavoriteService;
  recipeRating: RecipeRatingService;
  category: CategoryService;
}

export function createServices(
  recipeCache: CacheService,
  categoryCache: CacheService,
  bus: TypedEmitter,
  log: Logger,
): Services {
  const commentRepository = new CommentRepository(CommentModel);
  const categoryRepository = new CategoryRepository(CategoryModel);
  const favoriteRepository = new FavoriteRepository(FavoriteModel);
  const recipeRatingRepository = new RecipeRatingRepository(RecipeRatingModel);

  const commentService = createCommentService(
    commentRepository,
    RecipeModel,
    UserModel,
  );
  const favoriteService = createFavoriteService(
    favoriteRepository,
    RecipeModel,
    UserModel,
  );
  const userService = createUserService(
    commentService,
    favoriteService,
    UserModel,
  );
  const recipeRatingService = createRecipeRatingService(
    recipeRatingRepository,
    RecipeModel,
    UserModel,
    bus,
  );
  const categoryService = createCategoryService(
    categoryRepository,
    RecipeModel,
    categoryCache,
    bus,
  );
  const recipeService = createRecipeService(
    RecipeModel,
    UserModel,
    FavoriteModel,
    CategoryModel,
    recipeCache,
    bus,
  );
  const authService = createAuthService(UserModel, log);

  return {
    auth: authService,
    user: userService,
    recipe: recipeService,
    comment: commentService,
    favorite: favoriteService,
    recipeRating: recipeRatingService,
    category: categoryService,
  };
}
