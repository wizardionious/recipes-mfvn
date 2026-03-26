import type { FastifyReply, FastifyRequest } from "fastify";
import { type JwtPayload, verifyToken } from "../utils/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid token" });
  }

  const token = authHeader.slice(7);

  try {
    request.user = verifyToken(token);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
