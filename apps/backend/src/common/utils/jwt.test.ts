import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import type { JwtPayload } from "./jwt.js";
import { signToken, verifyToken } from "./jwt.js";

vi.mock("@/config/env.js", () => ({
  env: {
    JWT_SECRET: "test-secret-key-for-unit-tests",
    JWT_EXPIRES_IN: "1h",
  },
}));

describe("jwt utils", () => {
  const payload = {
    userId: "507f1f77bcf86cd799439011",
    email: "test@example.com",
    role: "user",
  } satisfies JwtPayload;

  describe("signToken", () => {
    it("should return a JWT string", () => {
      const token = signToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should produce different tokens for different payloads", () => {
      const token1 = signToken(payload);
      const token2 = signToken({ ...payload, email: "other@test.com" });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should decode a valid token", () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("should throw on invalid token", () => {
      expect(() => verifyToken("not.a.token")).toThrow();
    });

    it("should throw on token signed with different secret", () => {
      const token = jwt.sign(payload, "other-secret");

      expect(() => verifyToken(token)).toThrow();
    });
  });
});
