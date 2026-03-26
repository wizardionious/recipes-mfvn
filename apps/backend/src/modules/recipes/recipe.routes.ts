import { authGuard } from "@common/middleware/auth.guard.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@recipes/recipe.schema.js";
import { RecipeService } from "@recipes/recipe.service.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const recipeService = new RecipeService();

export async function recipeRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/",
    {
      schema: {
        querystring: recipeQuerySchema,
        tags: ["Recipes"],
        summary: "Get all recipes with pagination",
      },
    },
    async (request, reply) => {
      const result = await recipeService.findAll(request.query);
      return reply.send(result);
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
        summary: "Get recipe by ID",
      },
    },
    async (request, reply) => {
      const recipe = await recipeService.findById(request.params.id);
      return reply.send(recipe);
    },
  );

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
      const recipe = await recipeService.create(request.body, request.user.userId);
      return reply.status(201).send(recipe);
    },
  );

  fastify.patch(
    "/:id",
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
      const recipe = await recipeService.update(
        request.params.id,
        request.body,
        request.user.userId,
      );
      return reply.send(recipe);
    },
  );

  fastify.delete(
    "/:id",
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
      await recipeService.delete(request.params.id, request.user.userId);
      return reply.status(204).send();
    },
  );
}
