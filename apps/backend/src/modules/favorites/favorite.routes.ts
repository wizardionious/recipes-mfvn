import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { recipeParamsSchema } from "@/modules/recipes/recipe.schema.js";

export interface FavoriteModuleOptions {
  service: FavoriteService;
}

export const favoriteRoutes: FastifyPluginAsync<FavoriteModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.boolean() }),
          },
          tags: ["Favorites"],
          summary: "Check if recipe is favorited",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const favorited = await service.isFavorited(request.params.id, {
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.send({ favorited });
      },
    )
    .post(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.literal(true) }),
          },
          tags: ["Favorites"],
          summary: "Add recipe to favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await service.add(request.params.id, {
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.send(result);
      },
    )
    .delete(
      "/:id/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.literal(false) }),
          },
          tags: ["Favorites"],
          summary: "Remove recipe from favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await service.remove(request.params.id, {
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.send(result);
      },
    );
};
