import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(
  error: FastifyError | (Error & { statusCode?: number }),
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: "Validation error",
      details: error.issues,
    });
    return;
  }

  const statusCode = ("statusCode" in error ? error.statusCode : undefined) ?? 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  reply.status(statusCode).send({ error: message });
}
