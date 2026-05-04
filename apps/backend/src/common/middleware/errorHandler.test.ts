import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { createMockReply, createMockRequest } from "@/__tests__/helpers.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/errors.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";

vi.mock("@/config/env.js", () => ({
  env: { NODE_ENV: "development" as const },
}));

describe("errorHandler", () => {
  let request: ReturnType<typeof createMockRequest>;
  let reply: ReturnType<typeof createMockReply>;

  beforeEach(() => {
    vi.clearAllMocks();
    request = createMockRequest();
    reply = createMockReply();
  });

  describe("AppError subclasses", () => {
    it("should handle AppError with custom statusCode", () => {
      errorHandler(new AppError("Not found", 404), request, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Not found",
        code: "INTERNAL_SERVER",
        status: 404,
      });
    });

    it("should handle AppError with 403", () => {
      errorHandler(new AppError("Forbidden", 403), request, reply);

      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Forbidden",
        code: "INTERNAL_SERVER",
        status: 403,
      });
    });

    it("should handle BadRequestError", () => {
      errorHandler(new BadRequestError("Invalid recipe ID"), request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Invalid recipe ID",
        code: "BAD_REQUEST",
        status: 400,
      });
    });

    it("should handle UnauthorizedError", () => {
      errorHandler(new UnauthorizedError("Not authorized"), request, reply);

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Not authorized",
        code: "UNAUTHORIZED",
        status: 401,
      });
    });

    it("should handle ForbiddenError", () => {
      errorHandler(
        new ForbiddenError("Not authorized to delete this recipe"),
        request,
        reply,
      );

      expect(reply.status).toHaveBeenCalledWith(403);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Not authorized to delete this recipe",
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("should handle NotFoundError", () => {
      errorHandler(new NotFoundError("Recipe not found"), request, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Recipe not found",
        code: "NOT_FOUND",
        status: 404,
      });
    });

    it("should handle ConflictError", () => {
      errorHandler(new ConflictError("Email already in use"), request, reply);

      expect(reply.status).toHaveBeenCalledWith(409);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Email already in use",
        code: "CONFLICT",
        status: 409,
      });
    });
  });

  describe("Zod and Mongoose errors", () => {
    it("should handle ZodError with validation details", () => {
      const error = new ZodError([
        {
          code: "too_small",
          origin: "string",
          minimum: 1,
          inclusive: true,
          path: ["text"],
          message: "Required",
        },
      ]);

      errorHandler(error, request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Validation error",
        code: "VALIDATION_ERROR",
        status: 400,
        details: { issues: error.issues },
      });
    });

    it("should handle Mongoose CastError", () => {
      const error = Object.assign(new Error("Cast to ObjectId failed"), {
        name: "CastError",
        path: "_id",
        value: "invalid-id",
      });

      errorHandler(error, request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Invalid _id: invalid-id",
        code: "INVALID_FIELD",
        status: 400,
      });
    });

    it("should handle MongoDB duplicate key error", () => {
      const error = Object.assign(new Error("Duplicate key"), {
        code: 11000,
      });

      errorHandler(error, request, reply);

      expect(reply.status).toHaveBeenCalledWith(409);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Duplicate entry",
        code: "DUPLICATE_ENTRY",
        status: 409,
      });
    });
  });

  describe("generic errors", () => {
    it("should pass through statusCode when not 500", () => {
      const error = Object.assign(new Error("Bad request"), {
        statusCode: 400,
      });

      errorHandler(error, request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Bad request",
        code: "HTTP_ERROR",
        status: 400,
      });
    });

    it("should show message and stack in development for 500", () => {
      const error = new Error("Something broke");
      error.stack = "Error: Something broke\n    at test";

      errorHandler(error, request, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Something broke",
        code: "INTERNAL_SERVER_ERROR",
        status: 500,
        stack: error.stack,
      });
    });
  });

  describe("logging", () => {
    it("should log error code for typed errors", () => {
      errorHandler(new NotFoundError("Recipe not found"), request, reply);

      expect(request.log.error).toHaveBeenCalledWith(
        {
          err: expect.any(NotFoundError),
          method: "GET",
          url: "/test",
          errorCode: "NOT_FOUND",
        },
        "Request error",
      );
    });
  });
});
