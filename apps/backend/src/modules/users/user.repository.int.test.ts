import { describe, expect, it } from "vitest";
import { createDbUser } from "@/__tests__/db-factories.js";
import { UserModel } from "./user.model.js";
import { UserRepository } from "./user.repository.js";

describe("UserRepository", () => {
  const repository = new UserRepository(UserModel);

  describe("create", () => {
    it("should create a user", async () => {
      const user = await repository.create({
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
      });

      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("Test User");
      expect(user.role).toBe("user");
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const created = await createDbUser({ name: "Alice" });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.name).toBe("Alice");
    });

    it("should return null for non-existing id", async () => {
      const found = await repository.findById("507f1f77bcf86cd799439011");

      expect(found).toBeNull();
    });
  });

  describe("findOne", () => {
    it("should find a user by email", async () => {
      await createDbUser({ email: "find@example.com" });

      const found = await repository.findOne({ email: "find@example.com" });

      expect(found).not.toBeNull();
      expect(found?.email).toBe("find@example.com");
    });

    it("should select password with select option", async () => {
      await createDbUser({
        email: "pass@example.com",
        password: "secret123",
      });

      const found = await repository.findOne(
        { email: "pass@example.com" },
        { select: "+password" },
      );

      expect(found).not.toBeNull();
      expect(found?.password).toBe("secret123");
    });

    it("should not include password by default", async () => {
      await createDbUser({ email: "nopass@example.com" });

      const found = await repository.findOne({ email: "nopass@example.com" });

      expect(found).not.toBeNull();
      expect(found).not.toHaveProperty("password");
    });
  });

  describe("exists", () => {
    it("should return true when user exists", async () => {
      const _created = await createDbUser();

      const result = await repository.exists({ _id: _created._id });

      expect(result).toBe(true);
    });

    it("should return false when user does not exist", async () => {
      const result = await repository.exists({
        email: "nonexistent@example.com",
      });

      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete a user by id", async () => {
      const created = await createDbUser();

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
