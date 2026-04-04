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

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

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
    service: createAuthService(UserModel),
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
    ),
    favoriteService: createFavoriteService(
      FavoriteModel,
      RecipeModel,
      UserModel,
    ),
    commentService: createCommentService(CommentModel, RecipeModel, UserModel),
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: createCategoryService(CategoryModel),
    prefix: "/api/categories",
  });

  return app;
}
