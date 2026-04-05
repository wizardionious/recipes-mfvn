import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard } from "@/common/middleware/auth.guard.js";
import {
  categoryParamsSchema,
  createCategorySchema,
} from "@/modules/categories/category.schema.js";
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
          tags: ["Categories"],
          summary: "Get all categories",
        },
      },
      async (_request, reply) => {
        const categories = await service.findAll();
        return reply.send(categories);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createCategorySchema,
          tags: ["Categories"],
          summary: "Create a category",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        const category = await service.create(request.body);
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
        onRequest: authGuard,
      },
      async (request, reply) => {
        await service.deleteById(request.params.id);
        return reply.status(204).send();
      },
    );
};
