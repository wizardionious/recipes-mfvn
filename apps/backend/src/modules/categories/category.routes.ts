import { categoryParamsSchema, createCategorySchema } from "@categories/category.schema.js";
import { CategoryService } from "@categories/category.service.js";
import { authGuard } from "@common/middleware/auth.guard.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const categoryService = new CategoryService();

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Categories"],
        summary: "Get all categories",
      },
    },
    async (_request, reply) => {
      const categories = await categoryService.findAll();
      return reply.send(categories);
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createCategorySchema,
        tags: ["Categories"],
        summary: "Create a category",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const category = await categoryService.create(request.body);
      return reply.status(201).send(category);
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: categoryParamsSchema,
        tags: ["Categories"],
        summary: "Delete a category",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      await categoryService.deleteById(request.params.id);
      return reply.status(204).send();
    },
  );
}
