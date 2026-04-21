import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createCacheService } from "@/common/cache/create-cache.service.js";
import type { Logger } from "@/common/logger.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { createRateLimitOptions } from "@/config/rate-limit.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { createAuthService } from "@/modules/auth/auth.service.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { createCommentService } from "@/modules/comments/comment.service.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { favoriteRoutes } from "@/modules/favorites/favorite.routes.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { recipeRatingRoutes } from "@/modules/recipe-ratings/recipe-rating.routes.js";
import { createRecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";
import { UserModel } from "@/modules/users/user.model.js";
import { userRoutes } from "@/modules/users/user.routes.js";
import { createUserService } from "@/modules/users/user.service.js";

export async function buildApp(log: Logger) {
  const app = Fastify({
    loggerInstance: log,
  });

  const cache = await createCacheService(
    {
      backend: env.CACHE_BACKEND,
      redis: env.REDIS_URL ? { url: env.REDIS_URL } : undefined,
    },
    app.log,
  );

  // Validation & serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Error handling
  app.setErrorHandler(errorHandler);

  // CORS
  app.register(fastifyCors, { origin: true });

  // Security headers
  app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // Rate limiting
  app.register(fastifyRateLimit, createRateLimitOptions());

  // Swagger
  app.register(fastifySwagger, swaggerOptions);
  app.register(fastifySwaggerUi, swaggerUiOptions);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  const commentService = createCommentService(
    CommentModel,
    RecipeModel,
    UserModel,
  );
  const favoriteService = createFavoriteService(
    FavoriteModel,
    RecipeModel,
    UserModel,
  );
  const userService = createUserService(
    commentService,
    favoriteService,
    UserModel,
  );
  const recipeRatingService = createRecipeRatingService(
    RecipeRatingModel,
    RecipeModel,
    UserModel,
    cache,
  );
  const categoryService = createCategoryService(
    CategoryModel,
    RecipeModel,
    cache,
  );
  const recipeService = createRecipeService(
    RecipeModel,
    UserModel,
    FavoriteModel,
    CategoryModel,
    cache,
  );
  const authService = createAuthService(UserModel, log);

  // Routes
  app.register(authRoutes, {
    service: authService,
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: userService,
    prefix: "/api/users",
  });
  app.register(recipeRoutes, {
    service: recipeService,
    commentService,
    prefix: "/api/recipes",
  });
  app.register(favoriteRoutes, {
    service: favoriteService,
    prefix: "/api/recipes",
  });
  app.register(recipeRatingRoutes, {
    service: recipeRatingService,
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: categoryService,
    prefix: "/api/categories",
  });

  app.addHook("onClose", async () => {
    await cache.close();
  });

  return app;
}
