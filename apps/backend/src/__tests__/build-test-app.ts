import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import type { JwtPayload } from "@/common/utils/jwt.js";

export function createTestApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);
  return app;
}

export function authHeader(payload: JwtPayload): { authorization: string } {
  return { authorization: `Bearer fake-token-${payload.userId}` };
}
