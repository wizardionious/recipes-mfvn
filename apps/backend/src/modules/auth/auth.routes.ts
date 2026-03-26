import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard } from "@/common/middleware/auth.guard.js";
import { loginSchema, registerSchema } from "@/modules/auth/auth.schema.js";
import { AuthService } from "@/modules/auth/auth.service.js";

const authService = new AuthService();

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.post(
    "/register",
    {
      schema: {
        body: registerSchema,
        tags: ["Auth"],
        summary: "Register a new user",
      },
    },
    async (request, reply) => {
      const result = await authService.register(request.body);
      return reply.status(201).send(result);
    },
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        tags: ["Auth"],
        summary: "Login user",
      },
    },
    async (request, reply) => {
      const result = await authService.login(request.body);
      return reply.status(200).send(result);
    },
  );

  fastify.get(
    "/me",
    {
      schema: {
        tags: ["Auth"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const user = await authService.me(request.user.userId);
      return reply.send(user);
    },
  );
}
