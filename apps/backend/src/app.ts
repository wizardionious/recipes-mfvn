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
import { createNamespacedCache } from "@/common/cache/namespaced-cache.js";
import { createEventBus } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { createRateLimitOptions } from "@/config/rate-limit.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";
import { favoriteRoutes } from "@/modules/favorites/favorite.routes.js";
import { recipeRatingRoutes } from "@/modules/recipe-ratings/recipe-rating.routes.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";
import { reviewRoutes } from "@/modules/reviews/review.routes.js";
import { userRoutes } from "@/modules/users/user.routes.js";
import { createServices } from "./app.services.js";

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

  const bus = createEventBus();
  const recipeCache = createNamespacedCache("recipes", cache);
  const categoryCache = createNamespacedCache("categories", cache);
  const services = createServices(recipeCache, categoryCache, bus, log);

  // Cross-service cache invalidation via events
  bus.on("category:changed", () => recipeCache.deletePattern("*"));
  bus.on("recipe:rated", () => recipeCache.deletePattern("*"));

  // Routes
  app.register(authRoutes, {
    service: services.auth,
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: services.user,
    prefix: "/api/users",
  });
  app.register(recipeRoutes, {
    service: services.recipe,
    commentService: services.comment,
    prefix: "/api/recipes",
  });
  app.register(favoriteRoutes, {
    service: services.favorite,
    prefix: "/api/recipes",
  });
  app.register(recipeRatingRoutes, {
    service: services.recipeRating,
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: services.category,
    prefix: "/api/categories",
  });
  app.register(reviewRoutes, {
    service: services.review,
    prefix: "/api/reviews",
  });

  app.addHook("onClose", async () => {
    await cache.close();
  });

  return app;
}
