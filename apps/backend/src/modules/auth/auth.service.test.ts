import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUserDoc } from "@/__tests__/helpers.js";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
import { createAuthService } from "./auth.service.js";

const { signToken } = vi.hoisted(() => ({
  signToken: vi.fn().mockReturnValue("mock-jwt-token"),
}));

vi.mock("@/common/utils/jwt.js", () => ({ signToken }));

describe("authService", () => {
  const mockUserRepository = {
    findOne: vi.fn(),
    exists: vi.fn(),
    create: vi.fn(),
  };
  const mockPasswordService = {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    verify: vi.fn().mockResolvedValue(true),
  };
  const mockLogger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };
  const service = createAuthService(
    mockUserRepository,
    mockPasswordService,
    mockLogger,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register user and return auth response", async () => {
      mockUserRepository.exists.mockResolvedValue(false);
      const doc = createUserDoc({ email: "new@test.com", name: "New User" });
      mockUserRepository.create.mockResolvedValue(doc);

      const result = await service.register({
        email: "new@test.com",
        password: "Password123!",
        name: "New User",
      });

      expect(mockUserRepository.exists).toHaveBeenCalledWith({
        email: "new@test.com",
      });
      expect(mockPasswordService.hash).toHaveBeenCalledWith("Password123!");
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: "new@test.com",
        password: "hashed-password",
        name: "New User",
      });
      expect(signToken).toHaveBeenCalled();
      expect(result.user.email).toBe("new@test.com");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("should throw ConflictError when email already in use", async () => {
      mockUserRepository.exists.mockResolvedValue(true);

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
      mockUserRepository.findOne.mockResolvedValue(doc);

      const result = await service.login({
        email: "user@test.com",
        password: "correct-password",
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        { email: "user@test.com" },
        { select: "+password" },
      );
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        "correct-password",
        "hashedPassword",
      );
      expect(result.user.email).toBe("user@test.com");
      expect(result.token).toBe("mock-jwt-token");
    });

    it("should throw UnauthorizedError when user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: "nobody@test.com", password: "pass" }),
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.login({ email: "nobody@test.com", password: "pass" }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw UnauthorizedError when password is wrong", async () => {
      const doc = createUserDoc({ email: "user@test.com" });
      mockUserRepository.findOne.mockResolvedValue(doc);
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(
        service.login({ email: "user@test.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
