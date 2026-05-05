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

export type FastifyValidationError = FastifyError & {
  validation: {
    keyword: string;
    instancePath: string;
    message: string;
  }[];
};

function isFastifyValidationError(
  error: unknown,
): error is FastifyValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string" &&
    (error as { code: string }).code.startsWith("FST_ERR_VALIDATION")
  );
}

interface ErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
  stack?: string;
}

function buildErrorResponse(
  status: number,
  message: string,
  code: string,
  details?: unknown,
  stack?: string,
): ErrorResponse {
  const response: ErrorResponse = { error: message, code, status };
  if (details !== undefined) {
    response.details = details;
  }
  if (stack !== undefined) {
    response.stack = stack;
  }
  return response;
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
    reply
      .status(error.statusCode)
      .send(
        buildErrorResponse(
          error.statusCode,
          error.message,
          error.code ?? "INTERNAL_SERVER",
        ),
      );
    return;
  }

  if (isFastifyValidationError(error)) {
    reply.status(400).send(
      buildErrorResponse(
        400,
        "Validation error",
        "VALIDATION_ERROR",
        error.validation.map(({ message, instancePath }) => ({
          message,
          field: instancePath.split("/").pop(),
        })),
      ),
    );
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send(
      buildErrorResponse(400, "Validation error", "VALIDATION_ERROR", {
        issues: error.issues,
      }),
    );
    return;
  }

  if (isMongooseCastError(error)) {
    reply
      .status(400)
      .send(
        buildErrorResponse(
          400,
          `Invalid ${error.path}: ${String(error.value)}`,
          "INVALID_FIELD",
        ),
      );
    return;
  }

  if (isMongooseValidationError(error)) {
    const details = Object.entries(error.errors).map(([field, err]) => ({
      field,
      message: err.message,
    }));
    reply
      .status(400)
      .send(
        buildErrorResponse(
          400,
          "Validation failed",
          "VALIDATION_FAILED",
          details,
        ),
      );
    return;
  }

  if (isMongoDuplicateKeyError(error)) {
    reply
      .status(409)
      .send(buildErrorResponse(409, "Duplicate entry", "DUPLICATE_ENTRY"));
    return;
  }

  if (isFastifyBodyError(error)) {
    reply
      .status(400)
      .send(buildErrorResponse(400, error.message, "INVALID_BODY"));
    return;
  }

  const statusCode =
    ("statusCode" in error ? error.statusCode : undefined) ?? 500;

  if (statusCode !== 500) {
    reply
      .status(statusCode)
      .send(buildErrorResponse(statusCode, error.message, "HTTP_ERROR"));
    return;
  }

  if (isDev) {
    reply
      .status(500)
      .send(
        buildErrorResponse(
          500,
          error.message,
          "INTERNAL_SERVER_ERROR",
          undefined,
          error.stack,
        ),
      );
    return;
  }

  reply
    .status(500)
    .send(
      buildErrorResponse(500, "Internal server error", "INTERNAL_SERVER_ERROR"),
    );
}
