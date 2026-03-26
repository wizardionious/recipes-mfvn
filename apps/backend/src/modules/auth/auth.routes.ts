import { loginSchema, registerSchema } from "@auth/auth.schema.js";
import { AuthService } from "@auth/auth.service.js";
import { authGuard } from "@common/middleware/auth.guard.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

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
      const user = await import("./user.model.js").then((m) =>
        m.User.findById(request.user.userId).lean(),
      );
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }
      return reply.send({
        user: { id: user._id, email: user.email, name: user.name },
      });
    },
  );
}
