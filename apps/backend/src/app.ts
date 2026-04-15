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
import type { CacheService } from "@/common/cache/cache.service.js";
import { createCacheService } from "@/common/cache/create-cache.service.js";
import type { Logger } from "@/common/logger.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { createRateLimitOptions } from "@/config/rate-limit.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes, createAuthService } from "@/modules/auth/index.js";
import {
  CategoryModel,
  categoryRoutes,
  createCategoryService,
} from "@/modules/categories/index.js";
import {
  CommentModel,
  createCommentService,
} from "@/modules/comments/index.js";
import {
  createFavoriteService,
  FavoriteModel,
  favoriteRoutes,
} from "@/modules/favorites/index.js";
import {
  createRecipeService,
  RecipeModel,
  recipeRoutes,
} from "@/modules/recipes/index.js";
import {
  createUserService,
  UserModel,
  userRoutes,
} from "@/modules/users/index.js";

declare module "fastify" {
  interface FastifyInstance {
    cache: CacheService;
  }
}

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

  app.decorate("cache", cache);

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

  // Routes
  app.register(authRoutes, {
    service: createAuthService(UserModel, log),
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: createUserService(
      createCommentService(CommentModel, RecipeModel, UserModel),
      createFavoriteService(FavoriteModel, RecipeModel, UserModel),
      UserModel,
    ),
    prefix: "/api/users",
  });
  app.register(recipeRoutes, {
    service: createRecipeService(
      RecipeModel,
      UserModel,
      FavoriteModel,
      CategoryModel,
      cache,
    ),
    commentService: createCommentService(CommentModel, RecipeModel, UserModel),
    prefix: "/api/recipes",
  });
  app.register(favoriteRoutes, {
    service: createFavoriteService(FavoriteModel, RecipeModel, UserModel),
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: createCategoryService(CategoryModel, RecipeModel, cache),
    prefix: "/api/categories",
  });

  app.addHook("onClose", async () => {
    await cache.close();
  });

  return app;
}
