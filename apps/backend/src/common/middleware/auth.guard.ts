import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors.js";
import type { JwtPayload } from "../utils/jwt.js";
import { verifyToken } from "../utils/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export type AuthenticatedRequest = FastifyRequest & {
  user: JwtPayload;
};

export function assertAuthenticated(
  request: FastifyRequest,
): asserts request is AuthenticatedRequest {
  if (!request.user) {
    throw new UnauthorizedError("Not authorized");
  }
}

export function extractToken(request: FastifyRequest): string {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Missing authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Missing or invalid token");
  }

  if (!parts[1]) {
    throw new UnauthorizedError("Missing token");
  }

  return parts[1];
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = extractToken(request);
    request.user = verifyToken(token);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.headers.authorization) {
    return;
  }

  return authGuard(request, reply);
}
