import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockReply, createMockRequest } from "@/__tests__/helpers.js";
import { UnauthorizedError } from "@/common/errors.js";
import {
  assertAuthenticated,
  authGuard,
  extractToken,
  optionalAuth,
} from "@/common/middleware/auth.guard.js";
import type { JwtPayload } from "@/common/utils/jwt.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("auth.guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractToken", () => {
    it("should extract token from valid Bearer header", () => {
      const request = createMockRequest({
        headers: { authorization: "Bearer my-jwt-token" },
      });

      const token = extractToken(request);

      expect(token).toBe("my-jwt-token");
    });

    it("should throw UnauthorizedError when header is missing", () => {
      const request = createMockRequest({ headers: {} });

      expect(() => extractToken(request)).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when scheme is not Bearer", () => {
      const request = createMockRequest({
        headers: { authorization: "Basic abc123" },
      });

      expect(() => extractToken(request)).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when token part is missing", () => {
      const request = createMockRequest({
        headers: { authorization: "Bearer " },
      });

      expect(() => extractToken(request)).toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError on empty string header", () => {
      const request = createMockRequest({
        headers: { authorization: "" },
      });

      expect(() => extractToken(request)).toThrow(UnauthorizedError);
    });
  });

  describe("assertAuthenticated", () => {
    it("should not throw when user is present", () => {
      const request = createMockRequest({
        user: { userId: "123", email: "test@test.com", role: "user" },
      });

      expect(() => assertAuthenticated(request)).not.toThrow();
    });

    it("should throw UnauthorizedError when user is not set", () => {
      const request = createMockRequest();

      expect(() => assertAuthenticated(request)).toThrow(UnauthorizedError);
    });
  });

  describe("authGuard", () => {
    it("should set request.user on valid token", async () => {
      const payload = {
        userId: "123",
        email: "test@test.com",
        role: "user",
      } satisfies JwtPayload;
      verifyToken.mockReturnValue(payload);

      const request = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const reply = createMockReply();

      await authGuard(request, reply);

      expect(verifyToken).toHaveBeenCalledWith("valid-token");
      expect(request.user).toEqual(payload);
    });

    it("should return 401 on invalid token", async () => {
      verifyToken.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      const request = createMockRequest({
        headers: { authorization: "Bearer bad-token" },
      });
      const reply = createMockReply();

      await authGuard(request, reply);

      expect(reply.status).toHaveBeenCalledWith(401);
      expect(reply.send).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
    });
  });

  describe("optionalAuth", () => {
    it("should skip when no authorization header", async () => {
      const request = createMockRequest({ headers: {} });
      const reply = createMockReply();

      await optionalAuth(request, reply);

      expect(verifyToken).not.toHaveBeenCalled();
    });

    it("should call authGuard when authorization header is present", async () => {
      const payload = {
        userId: "123",
        email: "test@test.com",
        role: "user",
      } satisfies JwtPayload;
      verifyToken.mockReturnValue(payload);

      const request = createMockRequest({
        headers: { authorization: "Bearer valid-token" },
      });
      const reply = createMockReply();

      await optionalAuth(request, reply);

      expect(request.user).toEqual(payload);
    });
  });
});
