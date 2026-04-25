import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockLogger,
  createMockUserModel,
  createUserDoc,
} from "@/__tests__/helpers.js";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
import type { UserModelType } from "@/modules/users/user.model.js";
import { createAuthService } from "./auth.service.js";

const { signToken } = vi.hoisted(() => ({
  signToken: vi.fn().mockReturnValue("mock-jwt-token"),
}));

vi.mock("@/common/utils/jwt.js", () => ({ signToken }));

describe("authService", () => {
  const userModel = createMockUserModel();
  const log = createMockLogger();
  const service = createAuthService(userModel as unknown as UserModelType, log);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register user and return auth response", async () => {
      userModel.exists.mockResolvedValue(null);
      const doc = createUserDoc({
        email: "new@test.com",
        name: "New User",
        level: "Beginner",
      });
      userModel.create.mockResolvedValue({ ...doc, toObject: () => doc });

      const result = await service.register({
        email: "new@test.com",
        password: "Password123!",
        name: "New User",
        level: "Beginner",
      });

      expect(userModel.exists).toHaveBeenCalledWith({ email: "new@test.com" });
      expect(userModel.create).toHaveBeenCalled();
      expect(signToken).toHaveBeenCalled();
      expect(result.user.email).toBe("new@test.com");
      expect(result.user.level).toBe("Beginner");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("should throw ConflictError when email already in use", async () => {
      userModel.exists.mockResolvedValue({ _id: "existing-id" });

      await expect(
        service.register({
          email: "existing@test.com",
          password: "Password123!",
          name: "Existing",
        }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.register({
          email: "existing@test.com",
          password: "Password123!",
          name: "Existing",
        }),
      ).rejects.toThrow("Email already in use");
    });
  });

  describe("login", () => {
    it("should login and return auth response", async () => {
      const doc = createUserDoc({ email: "user@test.com" });
      userModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          ...doc,
          toObject: () => doc,
        }),
      });

      const result = await service.login({
        email: "user@test.com",
        password: "correct-password",
      });

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: "user@test.com",
      });
      expect(result.user.email).toBe("user@test.com");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("should throw UnauthorizedError when user not found", async () => {
      userModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.login({ email: "nobody@test.com", password: "pass" }),
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.login({ email: "nobody@test.com", password: "pass" }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw UnauthorizedError when password is wrong", async () => {
      const doc = createUserDoc({
        email: "user@test.com",
        comparePassword: vi.fn().mockResolvedValue(false),
      });
      userModel.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          ...doc,
          toObject: () => doc,
        }),
      });

      await expect(
        service.login({ email: "user@test.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
