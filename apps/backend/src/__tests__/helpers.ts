import type { Minutes, UserRole } from "@recipes/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Types } from "mongoose";
import type { Mock } from "vitest";
import { vi } from "vitest";
import type { CacheService } from "@/common/cache/cache.service.js";
import { createMemoryCache } from "@/common/cache/memory-cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import { createEventBus } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CommentDocument } from "@/modules/comments/comment.model.js";
import type {
  RecipeDocument,
  RecipeDocumentPopulated,
} from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

type LocalProcedure = (...args: unknown[]) => unknown;
function viFn<T extends LocalProcedure>(fn?: T): Mock<T> {
  return vi.fn(fn);
}

// ── Logger mocks ──

export interface MockLogger extends Logger {
  spies: {
    fatal: Mock;
    error: Mock;
    warn: Mock;
    info: Mock;
    debug: Mock;
    trace: Mock;
  };
}

export function createMockLogger(): MockLogger {
  const spies = {
    fatal: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  };

  return {
    ...spies,
    spies,
  } as unknown as MockLogger;
}

// ── Fastify mocks ──

/**
 * Creates a mock Fastify request.
 *
 * @param overrides - Overrides for the request.
 * @returns A mock Fastify request.
 */
export function createMockRequest(
  overrides: Partial<FastifyRequest> = {},
): FastifyRequest {
  return {
    log: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    method: "GET",
    url: "/test",
    headers: {},
    ...overrides,
  } as unknown as FastifyRequest;
}

/**
 * Creates a mock Fastify reply.
 *
 * @returns A mock Fastify reply.
 */
export function createMockReply(): FastifyReply {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  return {
    status,
    send,
  } as unknown as FastifyReply;
}

// ── Document factories ──

/**
 * Creates new ObjectId.
 *
 * @returns A new ObjectId.
 */
export function createObjectId(): Types.ObjectId {
  return new Types.ObjectId();
}

export function createCategoryDoc(
  overrides: Partial<CategoryDocument> = {},
): CategoryDocument {
  const _id = createObjectId();
  return {
    _id,
    name: "Test Category",
    slug: "test-category",
    description: "A test category",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  } as CategoryDocument;
}

export function createUserDoc(
  overrides: Partial<UserDocument> = {},
): UserDocument {
  const _id = createObjectId();
  return {
    _id,
    email: "test@example.com",
    password: "hashedPassword",
    name: "Test User",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    comparePassword: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createRecipeDoc(
  overrides: Partial<RecipeDocument> = {},
): RecipeDocument {
  const _id = createObjectId();
  return {
    _id,
    title: "Test Recipe",
    description: "A test recipe",
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients"],
    category: createObjectId(),
    author: createObjectId(),
    difficulty: "easy",
    cookingTime: 30 as Minutes,
    servings: 4,
    isPublic: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function populateRecipeDoc(
  recipe: RecipeDocument,
  overrides: Partial<RecipeDocumentPopulated> = {},
): RecipeDocumentPopulated {
  return {
    ...recipe,
    category: { _id: createObjectId(), name: "Italian", slug: "italian" },
    author: { _id: createObjectId(), name: "Chef", email: "chef@test.com" },
    isFavorited: false,
    userRating: null,
    averageRating: null,
    ratingCount: 0,
    ...overrides,
  };
}

export function createCommentDoc(
  overrides: Partial<CommentDocument> = {},
): CommentDocument {
  const _id = createObjectId();
  return {
    _id,
    text: "Great recipe!",
    recipe: createObjectId(),
    author: createObjectId(),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// ── Mongoose model mock factories ──

export function createMockRepository(overrides: Record<string, Mock> = {}) {
  return {
    findById: viFn(),
    findOne: viFn(),
    exists: viFn(),
    create: viFn(),
    update: viFn(),
    delete: viFn(),
    aggregate: viFn(),
    ...overrides,
  };
}

const chainable = {
  select: viFn().mockReturnThis(),
  sort: viFn().mockReturnThis(),
  lean: viFn().mockResolvedValue(null),
};

export function createMockCategoryModel(overrides: Record<string, Mock> = {}) {
  return {
    find: viFn().mockReturnValue(chainable),
    aggregate: viFn(),
    create: viFn(),
    findByIdAndDelete: viFn(),
    countDocuments: viFn().mockResolvedValue(0),
    exists: viFn(),
    ...overrides,
  };
}

export function createMockCategoryRepository(
  overrides: Record<string, Mock> = {},
) {
  return {
    findMany: viFn(),
    findById: viFn(),
    findOne: viFn(),
    exists: viFn(),
    create: viFn(),
    delete: viFn(),
    aggregate: viFn(),
    ...overrides,
  };
}

export function createMockUserModel(overrides: Record<string, Mock> = {}) {
  return {
    findById: viFn().mockReturnValue(chainable),
    findOne: viFn().mockReturnValue(chainable),
    exists: viFn(),
    create: viFn(),
    ...overrides,
  };
}

export function createMockRecipeModel(overrides: Record<string, Mock> = {}) {
  return {
    findById: viFn(),
    aggregate: viFn(),
    create: viFn(),
    countDocuments: viFn().mockResolvedValue(0),
    exists: viFn(),
    ...overrides,
  };
}

export function createMockCommentModel(overrides: Record<string, Mock> = {}) {
  return {
    aggregate: viFn(),
    findById: viFn(),
    create: viFn(),
    ...overrides,
  };
}

export function createMockCommentRepository(
  overrides: Record<string, Mock> = {},
) {
  return {
    findByRecipe: viFn(),
    findByAuthor: viFn(),
    findById: viFn(),
    findOne: viFn(),
    create: viFn(),
    delete: viFn(),
    aggregate: viFn(),
    ...overrides,
  };
}

export function createMockFavoriteModel(overrides: Record<string, Mock> = {}) {
  return {
    aggregate: viFn(),
    create: viFn(),
    findOneAndDelete: viFn(),
    exists: viFn(),
    findOne: viFn(),
    ...overrides,
  };
}

export function createMockFavoriteRepository(
  overrides: Record<string, Mock> = {},
) {
  return {
    create: viFn(),
    delete: viFn(),
    exists: viFn(),
    findByUser: viFn(),
    findOne: viFn(),
    aggregate: viFn(),
    ...overrides,
  };
}

export function createMockRatingModel(overrides: Record<string, Mock> = {}) {
  return {
    findOneAndUpdate: viFn(),
    findOneAndDelete: viFn(),
    exists: viFn(),
    ...overrides,
  };
}

export function createMockRecipeRatingRepository(
  overrides: Record<string, Mock> = {},
) {
  return {
    ...createMockRepository(overrides),
    upsert: viFn(),
    ...overrides,
  };
}

// ── Cache mock ──

export interface MockCache extends CacheService {
  spies: {
    get: Mock;
    set: Mock;
    delete: Mock;
    deletePattern: Mock;
    flush: Mock;
  };
}

export function createMockCache(): MockCache {
  const memoryCache = createMemoryCache();

  const spies = {
    get: vi.spyOn(memoryCache, "get"),
    set: vi.spyOn(memoryCache, "set"),
    delete: vi.spyOn(memoryCache, "delete"),
    deletePattern: vi.spyOn(memoryCache, "deletePattern"),
    flush: vi.spyOn(memoryCache, "flush"),
  };

  return {
    ...memoryCache,
    spies,
  };
}

// ── Event bus mock ──

export interface MockBus extends TypedEmitter {
  emit: Mock;
}

export function createMockBus(): MockBus {
  const bus = createEventBus();
  const emit = vi.spyOn(bus, "emit");
  return Object.assign(bus, { emit });
}

// ── Service param builders ──

/**
 * Creates a new initiator.
 *
 * @param id - The initiator's ID. If not provided, a new ID will be generated.
 * @param role - The initiator's role. Defaults to "user".
 * @returns A new initiator.
 */
export function initiator(id?: string, role: UserRole = "user") {
  return {
    id: id ?? createObjectId().toString(),
    role,
  };
}

/**
 * Creates a new initiator without an ID or role.
 *
 * @returns A new initiator.
 */
export function noInitiator() {
  return { id: undefined, role: undefined };
}

/**
 * Creates a new query params with initiator.
 *
 * @param page - The page number.
 * @param limit - The number of items per page.
 * @param overrides - Overrides for the query params.
 * @returns A new query params.
 */
export function queryParams(
  page = 1,
  limit = 10,
  overrides: Record<string, unknown> = {},
) {
  return {
    query: { page, limit, ...overrides },
    initiator: initiator(),
  };
}
