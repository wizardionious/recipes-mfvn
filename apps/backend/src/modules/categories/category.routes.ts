import {
  categoryQuerySchema,
  categorySchema,
  createCategorySchema,
} from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import { rolesGuard } from "@/common/middleware/role.guard.js";
import { categoryParamsSchema } from "@/modules/categories/category.schema.js";
import type { CategoryService } from "@/modules/categories/category.service.js";

export interface CategoryModuleOptions {
  service: CategoryService;
}

export const categoryRoutes: FastifyPluginAsync<CategoryModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: categoryQuerySchema,
          response: {
            200: z.array(categorySchema),
          },
          tags: ["Categories"],
          summary: "Get all categories",
        },
      },
      async (request, reply) => {
        const categories = await service.findAll({
          query: request.query,
          initiator: { id: request.user?.userId, role: request.user?.role },
        });
        return reply.send(categories);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createCategorySchema,
          response: {
            201: categorySchema,
          },
          tags: ["Categories"],
          summary: "Create a category",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const category = await service.create({
          data: request.body,
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.status(201).send(category);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: categoryParamsSchema,
          tags: ["Categories"],
          summary: "Delete a category",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await service.deleteById(request.params.id, {
          initiator: { id: request.user.userId, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
