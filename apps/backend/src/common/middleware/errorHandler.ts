import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "@/common/errors.js";
import { env } from "@/config/env.js";

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

function isMongooseCastError(
  error: unknown,
): error is { name: "CastError"; path: string; value: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "CastError"
  );
}

function isMongooseValidationError(error: unknown): error is {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "ValidationError"
  );
}

function isFastifyBodyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string" &&
    (error as { code: string }).code.startsWith("FST_ERR_CTP")
  );
}

export function errorHandler(
  error: FastifyError | (Error & { statusCode?: number }),
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const isDev = env.NODE_ENV === "development";

  request.log.error(
    {
      err: error,
      method: request.method,
      url: request.url,
      ...("code" in error && typeof error.code === "string"
        ? { errorCode: error.code }
        : {}),
    },
    "Request error",
  );

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      error: "Validation error",
      details: error.issues,
    });
    return;
  }

  if (isMongooseCastError(error)) {
    reply.status(400).send({
      error: `Invalid ${error.path}: ${String(error.value)}`,
    });
    return;
  }

  if (isMongooseValidationError(error)) {
    const details = Object.entries(error.errors).map(([field, err]) => ({
      field,
      message: err.message,
    }));
    reply.status(400).send({
      error: "Validation failed",
      details,
    });
    return;
  }

  if (isMongoDuplicateKeyError(error)) {
    reply.status(409).send({
      error: "Duplicate entry",
    });
    return;
  }

  if (isFastifyBodyError(error)) {
    reply.status(400).send({
      error: error.message,
    });
    return;
  }

  const statusCode =
    ("statusCode" in error ? error.statusCode : undefined) ?? 500;

  if (statusCode !== 500) {
    reply.status(statusCode).send({ error: error.message });
    return;
  }

  if (isDev) {
    reply.status(500).send({
      error: error.message,
      stack: error.stack,
    });
    return;
  }

  reply.status(500).send({ error: "Internal server error" });
}
