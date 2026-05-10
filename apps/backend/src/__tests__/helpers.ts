import type { Minutes, RecipeComputed, UserRole } from "@recipes/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Types } from "mongoose";
import type { Mock } from "vitest";
import { vi } from "vitest";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CommentDocument } from "@/modules/comments/comment.model.js";
import type {
  RecipeDocument,
  RecipeDocumentPopulated,
} from "@/modules/recipes/recipe.model.js";
import type { ReviewDocument } from "@/modules/reviews/review.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";

type LocalProcedure = (...args: unknown[]) => unknown;
function viFn<T extends LocalProcedure>(fn?: T): Mock<T> {
  return vi.fn(fn);
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
    image: { url: "https://example.com/category.jpg" },
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
    image: { url: "https://example.com/image.jpg" },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function populateRecipeDoc(
  recipe: RecipeDocument,
  overrides: Partial<RecipeDocumentPopulated & RecipeComputed> = {},
): RecipeDocumentPopulated & RecipeComputed {
  return {
    ...recipe,
    category: {
      _id: createObjectId(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg" },
    },
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

export function createReviewDoc(
  overrides: Partial<ReviewDocument> = {},
): ReviewDocument {
  const _id = createObjectId();
  return {
    _id,
    text: "Amazing platform!",
    author: createObjectId(),
    rating: 5,
    isFeatured: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// ── Mongoose model mock factories ──

const chainable = {
  select: viFn().mockReturnThis(),
  sort: viFn().mockReturnThis(),
  lean: viFn().mockResolvedValue(null),
};

export function createMockUserModel(overrides: Record<string, Mock> = {}) {
  return {
    findById: viFn().mockReturnValue(chainable),
    findOne: viFn().mockReturnValue(chainable),
    exists: viFn(),
    create: viFn(),
    ...overrides,
  };
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
