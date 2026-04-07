import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import { commentQuerySchema } from "@/modules/comments/index.js";
import { favoriteQuerySchema } from "@/modules/favorites/favorite.schema.js";
import type { UserService } from "@/modules/users/index.js";

export interface UserPluginOptions {
  service: UserService;
}

export const userRoutes: FastifyPluginAsync<UserPluginOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/me",
      {
        schema: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);
        const user = await service.getCurrentUser(request.user.userId);
        return reply.send(user);
      },
    )
    .get(
      "/me/favorites",
      {
        schema: {
          querystring: favoriteQuerySchema,
          tags: ["Users"],
          summary: "Get current user's favorite recipes",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);
        const result = await service.getFavorites(request.user.userId, {
          query: request.query,
          initiator: request.user.userId,
        });
        return reply.send(result);
      },
    )
    .get(
      "/me/comments",
      {
        schema: {
          querystring: commentQuerySchema,
          tags: ["Users"],
          summary: "Get current user's comments",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);
        const result = await service.getComments(request.user.userId, {
          query: request.query,
          initiator: request.user.userId,
        });
        return reply.send(result);
      },
    );
};
