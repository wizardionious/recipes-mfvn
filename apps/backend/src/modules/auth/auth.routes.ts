import {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { env } from "@/config/env.js";
import type { AuthService } from "@/modules/auth/auth.service.js";

export interface AuthModuleOptions {
  service: AuthService;
}

export const authRoutes: FastifyPluginAsync<AuthModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/register",
      {
        schema: {
          body: registerSchema,
          response: {
            201: authResponseSchema,
          },
          tags: ["Auth"],
          summary: "Register a new user",
        },
        config: {
          rateLimit: {
            max: env.RATE_LIMIT_AUTH_MAX,
            timeWindow: env.RATE_LIMIT_AUTH_WINDOW,
          },
        },
      },
      async (request, reply) => {
        const result = await service.register(request.body);
        return reply.status(201).send(result);
      },
    )
    .post(
      "/login",
      {
        schema: {
          body: loginSchema,
          response: {
            200: authResponseSchema,
          },
          tags: ["Auth"],
          summary: "Login user",
        },
        config: {
          rateLimit: {
            max: env.RATE_LIMIT_AUTH_MAX,
            timeWindow: env.RATE_LIMIT_AUTH_WINDOW,
          },
        },
      },
      async (request, reply) => {
        const result = await service.login(request.body);
        return reply.status(200).send(result);
      },
    );
};
