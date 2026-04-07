import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

vi.mock("@/config/env.js", () => ({
  env: { NODE_ENV: "development" },
}));

const { errorHandler } = await import("@/common/middleware/errorHandler.js");
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = await import("@/common/errors.js");

function createMockReply() {
  const send = vi.fn();
  const status = vi.fn().mockReturnValue({ send });
  return {
    reply: { status } as unknown as Parameters<typeof errorHandler>[2],
    send,
    status,
  };
}

function createMockRequest() {
  return {
    log: { error: vi.fn() },
    method: "GET",
    url: "/test",
  } as unknown as Parameters<typeof errorHandler>[1];
}

describe("errorHandler", () => {
  let request: ReturnType<typeof createMockRequest>;
  let reply: Parameters<typeof errorHandler>[2];
  let send: ReturnType<typeof createMockReply>["send"];
  let status: ReturnType<typeof createMockReply>["status"];

  beforeEach(() => {
    vi.clearAllMocks();
    request = createMockRequest();
    const mock = createMockReply();
    reply = mock.reply;
    send = mock.send;
    status = mock.status;
  });

  it("should handle AppError with custom statusCode", () => {
    const error = new AppError("Not found", 404);

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("should handle AppError with 403", () => {
    const error = new AppError("Forbidden", 403);

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith({ error: "Forbidden" });
  });

  it("should handle BadRequestError", () => {
    const error = new BadRequestError("Invalid recipe ID");

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith({ error: "Invalid recipe ID" });
  });

  it("should handle UnauthorizedError", () => {
    const error = new UnauthorizedError("Not authorized");

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({ error: "Not authorized" });
  });

  it("should handle ForbiddenError", () => {
    const error = new ForbiddenError("Not authorized to delete this recipe");

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith({
      error: "Not authorized to delete this recipe",
    });
  });

  it("should handle NotFoundError", () => {
    const error = new NotFoundError("Recipe not found");

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith({ error: "Recipe not found" });
  });

  it("should handle ConflictError", () => {
    const error = new ConflictError("Email already in use");

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(409);
    expect(send).toHaveBeenCalledWith({ error: "Email already in use" });
  });

  it("should handle ZodError with validation details", () => {
    const error = new ZodError([
      {
        code: "too_small",
        minimum: 1,
        type: "string",
        inclusive: true,
        path: ["text"],
        message: "Required",
      } as never,
    ]);

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith({
      error: "Validation error",
      details: error.issues,
    });
  });

  it("should handle Mongoose CastError", () => {
    const error = Object.assign(new Error("Cast to ObjectId failed"), {
      name: "CastError",
      path: "_id",
      value: "invalid-id",
    });

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith({
      error: "Invalid _id: invalid-id",
    });
  });

  it("should handle MongoDB duplicate key error", () => {
    const error = Object.assign(new Error("Duplicate key"), {
      code: 11000,
    });

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(409);
    expect(send).toHaveBeenCalledWith({
      error: "Duplicate entry",
    });
  });

  it("should handle error with statusCode (not 500)", () => {
    const error = Object.assign(new Error("Bad request"), { statusCode: 400 });

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith({ error: "Bad request" });
  });

  it("should show error message and stack in development for 500", () => {
    const error = new Error("Something broke");
    error.stack = "Error: Something broke\n    at test";

    errorHandler(error, request, reply);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith({
      error: "Something broke",
      stack: error.stack,
    });
  });

  it("should log error code for typed errors", () => {
    const error = new NotFoundError("Recipe not found");

    errorHandler(error, request, reply);

    expect(request.log.error).toHaveBeenCalledWith(
      { err: error, method: "GET", url: "/test", errorCode: "NOT_FOUND" },
      "Request error",
    );
  });
});
