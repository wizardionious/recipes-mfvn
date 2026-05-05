import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureRootAdmin } from "@/common/bootstrap/admin.js";

const { UserModel } = await vi.hoisted(async () => ({
  UserModel: (await import("@/__tests__/helpers.js")).createMockUserModel(),
}));

vi.mock("@/config/env.js", () => ({
  env: {
    ROOT_ADMIN_EMAIL: "admin@test.com",
    ROOT_ADMIN_PASSWORD: "SecureP@ss123",
  },
}));
vi.mock("@/modules/users/user.model.js", () => ({
  UserModel,
}));

describe("ensureRootAdmin", () => {
  const mockLogger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create root admin when no admin exists", async () => {
    UserModel.findOne.mockResolvedValue(null);
    UserModel.create.mockResolvedValue({});

    await ensureRootAdmin(mockLogger);

    expect(UserModel.findOne).toHaveBeenCalledWith({ role: "admin" });
    expect(UserModel.create).toHaveBeenCalledWith({
      email: "admin@test.com",
      password: "SecureP@ss123",
      name: "Root Admin",
      role: "admin",
    });
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("should not create admin when one already exists", async () => {
    UserModel.findOne.mockResolvedValue({ email: "existing@admin.com" });

    await ensureRootAdmin(mockLogger);

    expect(UserModel.findOne).toHaveBeenCalledWith({ role: "admin" });
    expect(mockLogger.info).toHaveBeenCalled();
    expect(UserModel.create).not.toHaveBeenCalled();
  });
});
