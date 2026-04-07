import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  assertAuthenticated,
  authGuard,
  optionalAuth,
} from "@/common/middleware/auth.guard.js";
import type { CommentService } from "@/modules/comments/index.js";
import {
  commentParamsSchema,
  commentQuerySchema,
  createCommentSchema,
} from "@/modules/comments/index.js";
import type { FavoriteService } from "@/modules/favorites/index.js";
import type { RecipeService } from "@/modules/recipes/index.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/index.js";

export interface RecipeModuleOptions {
  service: RecipeService;
  favoriteService: FavoriteService;
  commentService: CommentService;
}

export const recipeRoutes: FastifyPluginAsync<RecipeModuleOptions> = async (
  fastify,
  { service, favoriteService, commentService },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: recipeQuerySchema,
          tags: ["Recipes"],
          summary: "Get all recipes with pagination",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const result = await service.findAll({
          query: request.query,
          initiator: request.user?.userId,
        });
        return reply.send(result);
      },
    )
    .get(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Get recipe by ID",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const recipe = await service.findById(request.params.id, {
          initiator: request.user?.userId,
        });
        return reply.send(recipe);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createRecipeSchema,
          tags: ["Recipes"],
          summary: "Create a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const recipe = await service.create({
          data: request.body,
          initiator: request.user.userId,
        });
        return reply.status(201).send(recipe);
      },
    )
    .patch(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          body: updateRecipeSchema,
          tags: ["Recipes"],
          summary: "Update a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const recipe = await service.update(request.params.id, {
          data: request.body,
          initiator: request.user.userId,
        });
        return reply.send(recipe);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await service.delete(request.params.id, {
          initiator: request.user.userId,
        });
        return reply.status(204).send();
      },
    )
    .post(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Add recipe to favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await favoriteService.add(request.params.id, {
          initiator: request.user.userId,
        });
        return reply.send(result);
      },
    )
    .delete(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Remove recipe from favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await favoriteService.remove(request.params.id, {
          initiator: request.user.userId,
        });
        return reply.send(result);
      },
    )
    .get(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Check if recipe is favorited",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.send({ favorited: false });
        }

        const favorited = await favoriteService.isFavorited(request.params.id, {
          initiator: userId,
        });
        return reply.send({ favorited });
      },
    )
    .get(
      "/:id/comments",
      {
        schema: {
          params: recipeParamsSchema,
          querystring: commentQuerySchema,
          tags: ["Recipes"],
          summary: "Get comments for a recipe",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const result = await commentService.findByRecipe(request.params.id, {
          query: request.query,
          initiator: request.user?.userId,
        });
        return reply.send(result);
      },
    )
    .post(
      "/:id/comments",
      {
        schema: {
          params: recipeParamsSchema,
          body: createCommentSchema,
          tags: ["Recipes"],
          summary: "Create a comment",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const comment = await commentService.create(request.params.id, {
          data: request.body,
          initiator: request.user.userId,
        });
        return reply.status(201).send(comment);
      },
    )
    .delete(
      "/comments/:id",
      {
        schema: {
          params: commentParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a comment",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await commentService.delete(request.params.id, {
          initiator: request.user.userId,
        });
        return reply.status(204).send();
      },
    );
};
