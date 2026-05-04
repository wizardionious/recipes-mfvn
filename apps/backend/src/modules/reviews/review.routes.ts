import {
  createReviewSchema,
  paginatedSchema,
  reviewParamsSchema,
  reviewQuerySchema,
  reviewSchema,
  reviewStatsSchema,
  updateReviewSchema,
} from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import { rolesGuard } from "@/common/middleware/role.guard.js";
import type { ReviewService } from "@/modules/reviews/review.service.js";

export interface ReviewModuleOptions {
  service: ReviewService;
}

export const reviewRoutes: FastifyPluginAsync<ReviewModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/testimonials",
      {
        schema: {
          response: {
            200: z.array(reviewSchema),
          },
          tags: ["Reviews"],
          summary: "Get featured testimonials",
        },
      },
      async (_request, reply) => {
        const testimonials = await service.findFeatured();
        return reply.send(testimonials);
      },
    )
    .get(
      "/stats",
      {
        schema: {
          response: {
            200: reviewStatsSchema,
          },
          tags: ["Reviews"],
          summary: "Get review statistics",
        },
      },
      async (_request, reply) => {
        const stats = await service.getStats();
        return reply.send(stats);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createReviewSchema,
          response: {
            201: reviewSchema,
          },
          tags: ["Reviews"],
          summary: "Create a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.create({
          data: request.body,
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.status(201).send(review);
      },
    )
    .get(
      "/",
      {
        schema: {
          querystring: reviewQuerySchema,
          response: {
            200: paginatedSchema(reviewSchema),
          },
          tags: ["Reviews"],
          summary: "Get all reviews",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await service.findAll({
          query: request.query,
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.send(result);
      },
    )
    .patch(
      "/:id",
      {
        schema: {
          params: reviewParamsSchema,
          body: updateReviewSchema,
          response: {
            200: reviewSchema,
          },
          tags: ["Reviews"],
          summary: "Update a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.update(request.params.id, {
          data: request.body,
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.send(review);
      },
    )
    .patch(
      "/:id/feature",
      {
        schema: {
          params: reviewParamsSchema,
          body: z.object({ isFeatured: z.boolean() }),
          response: {
            200: reviewSchema,
          },
          tags: ["Reviews"],
          summary: "Feature or unfeature a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.feature(
          request.params.id,
          {
            initiator: { id: request.user.userId, role: request.user.role },
          },
          request.body.isFeatured,
        );
        return reply.send(review);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: reviewParamsSchema,
          tags: ["Reviews"],
          summary: "Delete a review",
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
    );
};
