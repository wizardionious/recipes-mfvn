import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockRequest } from "@/__tests__/helpers.js";
import { assertAuthenticated } from "@/common/middleware/auth.guard.js";
import { ForbiddenError } from "../errors.js";
import { rolesGuard } from "./role.guard.js";

vi.mock("@/config/env.js", () => ({
  env: { JWT_SECRET: "test", JWT_EXPIRES_IN: "1h" },
}));

vi.mock(import("@/common/middleware/auth.guard.js"), { spy: true });

describe("rolesGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass when user has the required role", async () => {
    const request = createMockRequest();
    request.user = {
      userId: "123",
      email: "admin@test.com",
      role: "admin",
    };

    const guard = rolesGuard("admin");

    await expect(guard(request)).resolves.toBeUndefined();
    expect(assertAuthenticated).toHaveBeenCalledWith(request);
  });

  it("should throw ForbiddenError when user lacks the required role", async () => {
    const request = createMockRequest({
      user: {
        userId: "123",
        email: "user@test.com",
        role: "user",
      },
    });

    const guard = rolesGuard("admin");

    await expect(guard(request)).rejects.toThrow(ForbiddenError);
    await expect(guard(request)).rejects.toThrow("Insufficient permissions");
    expect(assertAuthenticated).toHaveBeenCalledWith(request);
  });

  it("should pass when user has any of multiple allowed roles", async () => {
    const request = createMockRequest({
      user: {
        userId: "123",
        email: "user@test.com",
        role: "user",
      },
    });
    const guard = rolesGuard("admin", "user");

    await expect(guard(request)).resolves.toBeUndefined();
    expect(assertAuthenticated).toHaveBeenCalledWith(request);
  });
});
