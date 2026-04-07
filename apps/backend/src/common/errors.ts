export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? "INTERNAL_SERVER";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code ?? "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 401, code ?? "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 403, code ?? "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 404, code ?? "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code ?? "CONFLICT");
    this.name = "ConflictError";
  }
}
