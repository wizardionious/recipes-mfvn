import {
  commentForRecipeSchema,
  paginatedSchema,
  recipeSchema,
} from "@recipes/shared";
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
import type { RecipeService } from "@/modules/recipes/index.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/index.js";

export interface RecipeModuleOptions {
  service: RecipeService;
  commentService: CommentService;
}

export const recipeRoutes: FastifyPluginAsync<RecipeModuleOptions> = async (
  fastify,
  { service, commentService },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: recipeQuerySchema,
          response: {
            200: paginatedSchema(recipeSchema),
          },
          tags: ["Recipes"],
          summary: "Get all recipes with pagination",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const result = await service.findAll({
          query: request.query,
          initiator: { id: request.user?.userId, role: request.user?.role },
        });
        return reply.send(result);
      },
    )
    .get(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: recipeSchema,
          },
          tags: ["Recipes"],
          summary: "Get recipe by ID",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const recipe = await service.findById(request.params.id, {
          initiator: { id: request.user?.userId, role: request.user?.role },
        });
        return reply.send(recipe);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createRecipeSchema,
          response: {
            201: recipeSchema,
          },
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
          initiator: { id: request.user.userId, role: request.user.role },
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
          response: {
            200: recipeSchema,
          },
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
          initiator: { id: request.user.userId, role: request.user.role },
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
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.status(204).send();
      },
    )
    .get(
      "/:id/comments",
      {
        schema: {
          params: recipeParamsSchema,
          querystring: commentQuerySchema,
          response: {
            200: paginatedSchema(commentForRecipeSchema),
          },
          tags: ["Recipes"],
          summary: "Get comments for a recipe",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const result = await commentService.findByRecipe(request.params.id, {
          query: request.query,
          initiator: { id: request.user?.userId, role: request.user?.role },
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
          response: {
            201: commentForRecipeSchema,
          },
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
          initiator: { id: request.user.userId, role: request.user.role },
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
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
