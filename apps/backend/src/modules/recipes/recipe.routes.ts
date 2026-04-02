import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard, optionalAuth } from "@/common/middleware/auth.guard.js";
import {
  commentParamsSchema,
  commentQuerySchema,
  createCommentSchema,
} from "@/modules/comments/comment.schema.js";
import { CommentService } from "@/modules/comments/comment.service.js";
import { FavoriteService } from "@/modules/favorites/favorite.service.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/recipe.schema.js";
import { RecipeService } from "@/modules/recipes/recipe.service.js";

const recipeService = new RecipeService();
const favoriteService = new FavoriteService();
const commentService = new CommentService();

export async function recipeRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  // GET — get all recipes with pagination, filtering and sorting
  fastify.get(
    "/",
    {
      schema: {
        querystring: recipeQuerySchema,
        tags: ["Recipes"],
        summary: "Get all recipes with pagination",
      },
      preHandler: optionalAuth,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      const result = await recipeService.findAll(request.query, userId);
      return reply.send(result);
    },
  );

  // GET — get recipe by ID
  fastify.get(
    "/:recipeId",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Get recipe by ID",
      },
      preHandler: optionalAuth,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      const recipe = await recipeService.findById(
        request.params.recipeId,
        userId,
      );
      return reply.send(recipe);
    },
  );

  // POST — create recipe
  fastify.post(
    "/",
    {
      schema: {
        body: createRecipeSchema,
        tags: ["Recipes"],
        summary: "Create a recipe",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const recipe = await recipeService.create(request.body, userId);
      return reply.status(201).send(recipe);
    },
  );

  // PATCH — update recipe
  fastify.patch(
    "/:recipeId",
    {
      schema: {
        params: recipeParamsSchema,
        body: updateRecipeSchema,
        tags: ["Recipes"],
        summary: "Update a recipe",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const recipe = await recipeService.update(
        request.params.recipeId,
        request.body,
        userId,
      );
      return reply.send(recipe);
    },
  );

  // DELETE — delete recipe
  fastify.delete(
    "/:recipeId",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Delete a recipe",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      await recipeService.delete(request.params.recipeId, userId);
      return reply.status(204).send();
    },
  );

  // POST — add to favorite
  fastify.post(
    "/:recipeId/favorite",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Add recipe to favorites",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const result = await favoriteService.add(userId, request.params.recipeId);
      return reply.send(result);
    },
  );

  // DELETE — remove from favorites
  fastify.delete(
    "/:recipeId/favorite",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Remove recipe from favorites",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const result = await favoriteService.remove(
        userId,
        request.params.recipeId,
      );
      return reply.send(result);
    },
  );

  // GET — check if favorited
  fastify.get(
    "/:recipeId/favorite",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Check if recipe is favorited",
      },
      preHandler: optionalAuth,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.send({ favorited: false });
      }

      const favorited = await favoriteService.isFavorited(
        userId,
        request.params.recipeId,
      );
      return reply.send({ favorited });
    },
  );

  // GET — get comments for recipe
  fastify.get(
    "/:recipeId/comments",
    {
      schema: {
        params: recipeParamsSchema,
        querystring: commentQuerySchema,
        tags: ["Recipes"],
        summary: "Get comments for a recipe",
      },
    },
    async (request, reply) => {
      const result = await commentService.findByRecipe(
        { recipeId: request.params.recipeId },
        request.query,
      );
      return reply.send(result);
    },
  );

  // POST — create comment
  fastify.post(
    "/:recipeId/comments",
    {
      schema: {
        params: recipeParamsSchema,
        body: createCommentSchema,
        tags: ["Recipes"],
        summary: "Create a comment",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const comment = await commentService.create(
        request.params.recipeId,
        userId,
        request.body,
      );
      return reply.status(201).send(comment);
    },
  );

  // DELETE — delete comment
  fastify.delete(
    "/comments/:commentId",
    {
      schema: {
        params: commentParamsSchema,
        tags: ["Recipes"],
        summary: "Delete a comment",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      await commentService.delete(request.params.commentId, userId);
      return reply.status(204).send();
    },
  );
}
