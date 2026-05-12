import type { CacheService } from "@/common/cache/cache.service.js";
import { createNamespacedCache } from "@/common/cache/namespaced-cache.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { createBcryptPasswordService } from "@/common/passwords/bcrypt.service.js";
import { env } from "@/config/env.js";
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
import { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { RecipeService } from "@/modules/recipes/recipe.service.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";
import { ReviewModel } from "@/modules/reviews/review.model.js";
import { ReviewRepository } from "@/modules/reviews/review.repository.js";
import type { ReviewService } from "@/modules/reviews/review.service.js";
import { createReviewService } from "@/modules/reviews/review.service.js";
import { UserModel } from "@/modules/users/user.model.js";
import { UserRepository } from "@/modules/users/user.repository.js";
import type { UserService } from "@/modules/users/user.service.js";
import { createUserService } from "@/modules/users/user.service.js";

export interface AppServices {
  auth: AuthService;
  user: UserService;
  recipe: RecipeService;
  comment: CommentService;
  favorite: FavoriteService;
  recipeRating: RecipeRatingService;
  category: CategoryService;
  review: ReviewService;

  recipeCache: CacheService;
  categoryCache: CacheService;

  log: Logger;
}

export function createServices(
  cache: CacheService,
  bus: TypedEmitter,
  log: Logger,
): AppServices {
  const commentRepository = new CommentRepository(CommentModel);
  const categoryRepository = new CategoryRepository(CategoryModel);
  const favoriteRepository = new FavoriteRepository(FavoriteModel);
  const recipeRatingRepository = new RecipeRatingRepository(RecipeRatingModel);
  const userRepository = new UserRepository(UserModel);
  const recipeRepository = new RecipeRepository(RecipeModel);
  const reviewRepository = new ReviewRepository(ReviewModel);

  const recipeCache = createNamespacedCache("recipes", cache);
  const categoryCache = createNamespacedCache("categories", cache);

  const passwordService = createBcryptPasswordService(env.BCRYPT_SALT_ROUNDS);

  const commentService = createCommentService(
    commentRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const favoriteService = createFavoriteService(
    favoriteRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const userService = createUserService(
    userRepository,
    commentService,
    favoriteService,
  );
  const recipeRatingService = createRecipeRatingService(
    recipeRatingRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const categoryService = createCategoryService(
    categoryRepository,
    recipeRepository,
    categoryCache,
    bus,
  );
  const recipeService = createRecipeService(
    recipeRepository,
    userRepository,
    favoriteRepository,
    categoryRepository,
    recipeCache,
    bus,
  );
  const reviewService = createReviewService(reviewRepository, userRepository);
  const authService = createAuthService(userRepository, passwordService, log);

  return {
    auth: authService,
    user: userService,
    recipe: recipeService,
    comment: commentService,
    favorite: favoriteService,
    recipeRating: recipeRatingService,
    category: categoryService,
    review: reviewService,

    recipeCache,
    categoryCache,

    log,
  };
}
