import { describe, expect, it } from "vitest";
import {
  createDbComment,
  createDbRecipe,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { noInitiator } from "@/__tests__/helpers.js";
import { CommentModel } from "./comment.model.js";
import { CommentRepository } from "./comment.repository.js";

describe("CommentRepository", () => {
  const repository = new CommentRepository(CommentModel);

  describe("findByRecipe", () => {
    it("should return comments for a public recipe with populated author and recipe", async () => {
      const author = await createDbUser({ name: "Alice" });
      const recipe = await createDbRecipe({
        author: author._id,
        title: "Pasta",
        isPublic: true,
      });
      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Delicious!",
      });

      const [comments, total] = await repository.findByRecipe(
        recipe._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(1);
      expect(comments).toHaveLength(1);
      expect(comments[0]?.text).toBe("Delicious!");
      expect(comments[0]?.author.name).toBe("Alice");
      expect(comments[0]?.recipe.title).toBe("Pasta");
    });

    it("should NOT show comments for a private recipe when unauthenticated", async () => {
      const author = await createDbUser();
      const recipe = await createDbRecipe({
        author: author._id,
        isPublic: false,
      });
      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Secret comment",
      });

      const [comments, total] = await repository.findByRecipe(
        recipe._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(0);
      expect(comments).toEqual([]);
    });

    it("should show comments for own private recipe when initiator is the author", async () => {
      const author = await createDbUser({ name: "Bob" });
      const recipe = await createDbRecipe({
        author: author._id,
        isPublic: false,
      });
      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "My private note",
      });

      const [comments, total] = await repository.findByRecipe(
        recipe._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: {
            id: author._id.toString(),
            role: "user",
          },
        },
      );

      expect(total).toBe(1);
      expect(comments[0]?.text).toBe("My private note");
    });

    it("should show comments for any recipe when initiator is admin", async () => {
      const author = await createDbUser();
      const admin = await createDbUser({ role: "admin" });
      const recipe = await createDbRecipe({
        author: author._id,
        isPublic: false,
      });
      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Admin sees this",
      });

      const [comments, total] = await repository.findByRecipe(
        recipe._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: {
            id: admin._id.toString(),
            role: "admin",
          },
        },
      );

      expect(total).toBe(1);
      expect(comments[0]?.text).toBe("Admin sees this");
    });

    it("should paginate correctly", async () => {
      const author = await createDbUser();
      const recipe = await createDbRecipe({
        author: author._id,
        isPublic: true,
      });

      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "First",
      });
      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Second",
      });

      const [comments, total] = await repository.findByRecipe(
        recipe._id.toString(),
        {
          query: { page: 2, limit: 1 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(2);
      expect(comments).toHaveLength(1);
    });
  });

  describe("findByAuthor", () => {
    it("should return comments by author with populated recipe", async () => {
      const author = await createDbUser({ name: "Charlie" });
      const recipe = await createDbRecipe({ title: "Soup", isPublic: true });

      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Tasty!",
      });

      const [comments, total] = await repository.findByAuthor(
        author._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(1);
      expect(comments[0]?.text).toBe("Tasty!");
      expect(comments[0]?.author.name).toBe("Charlie");
      expect(comments[0]?.recipe.title).toBe("Soup");
    });

    it("should NOT show comments on private recipes of other users", async () => {
      const author = await createDbUser();
      const otherUser = await createDbUser();
      const recipe = await createDbRecipe({
        author: otherUser._id,
        isPublic: false,
      });

      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "Hidden comment",
      });

      const [comments, total] = await repository.findByAuthor(
        author._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: noInitiator(),
        },
      );

      expect(total).toBe(0);
      expect(comments).toEqual([]);
    });

    it("should show own comments on own private recipes", async () => {
      const author = await createDbUser();
      const recipe = await createDbRecipe({
        author: author._id,
        isPublic: false,
      });

      await createDbComment({
        recipe: recipe._id,
        author: author._id,
        text: "My comment",
      });

      const [comments, total] = await repository.findByAuthor(
        author._id.toString(),
        {
          query: { page: 1, limit: 10 },
          initiator: {
            id: author._id.toString(),
            role: "user",
          },
        },
      );

      expect(total).toBe(1);
      expect(comments[0]?.text).toBe("My comment");
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a comment", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        text: "New comment",
        recipe: recipe._id.toString(),
        author: user._id.toString(),
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.text).toBe("New comment");
    });

    it("should delete a comment by id", async () => {
      const user = await createDbUser();
      const recipe = await createDbRecipe();

      const created = await repository.create({
        text: "To delete",
        recipe: recipe._id.toString(),
        author: user._id.toString(),
      });

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
